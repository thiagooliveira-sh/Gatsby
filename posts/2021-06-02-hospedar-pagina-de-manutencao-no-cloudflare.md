---
image: /assets/img/bash.png
title: Hospedar página de manutenção no Cloudflare
description: "Em alguns tipos de procedimentos, como uma migração, não podemos
  deixar o ambiente fora do ar, seja para evitar inconsistencia ou aguardar uma
  propagação DNS. "
date: 2021-06-04
category: dev
background: "#EB7728"
tags:
  - Cloudflare
  - HTML
  - DNS
  - CDN
  - WORKER
categories:
  - WORKER
  - Cloudflare
  - HTML
---
Pensando nisso, vamos utilizar um serviço bastante conhecido no mercado que é o Cloudflare, para hospedar uma página de manutenção estática que será disponibilizada diretamente na estrutura de CDN deles.

Antes disso, vamos falar um pouco sobre o que é o Cloudflare, de maneira bem simplificada, CloudFlare é um serviço de CDN que cria uma cópia em cache do seu site e distribui ela por centenas de servidores ao redor do mundo, reduzindo a carga no seu servidor principal primário e aumentando a velocidade de carregamento das suas páginas enviando elas a seus visitantes a partir do servidor proxy mais próximo dele.

Apesar de algumas funcionalidades do Cloudflare serem pagas, disponibiliza uma serie de serviços gratuitos e uma delas será a que utilizaremos, conta com uma funcionalidade chamada worker. 

O Worker é uma funcionalidade do Cloudflare que permite hospedar código javascript e html diretamente na infraestrutura do deles. Com a conta gratuita podemos realizar a criação de um worker e definir as rotas que vao utiliza-lo.

Primeiro de tudo precisamos que o seu site esteja apontado para o DNS do Cloudflare, para isso basta criar uma conta no site deles e realizar o apontamento do seu dominio para os DNS disponibilizado.

Feito isso, vamos na aba `Workers` > `Gerenciar Workers` e em seguida basta cliar em `Crie um worker`, você será direcionado a uma página semelhante a essa:

![cloudflare1](/assets/img/cloudflare1.png)

Pode remover todo o conteúdo pré existente e preencher com o código abaixo:

```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

/**
 * Respond to the request
 * @param {Request} request
 */
async function handleRequest(request) {

let modifiedHeaders = new Headers()
 
  modifiedHeaders.set('Content-Type', 'text/html')
  modifiedHeaders.append('Pragma', 'no-cache')

  return new Response(maintenancepage, {headers: modifiedHeaders})
}
let maintenancepage = `
 
<!doctype html>
<title>Site Maintenance</title>
<meta charset="utf-8">
<style>
    .content {
        background-color: rgba(255, 255, 255, 0.75); 
        background-size: 100%;      
        color: inherit;
        padding: 1px 100px 10px 100px;
        border-radius: 15px;        
    }
 
  h1 { font-size: 40pt;}
  body { font: 20px Helvetica, sans-serif; color: #333; }
  article { display: block; text-align: left; width: 75%; margin: 0 auto; }
  a:hover { color: #333; text-decoration: none; }
</style>
 
<article> 
  <div class="background">
    <div class="content">
      <h1>Em manutenção!</h1>
        <p>Pedimos desculpas pelo transtorno, no momento estamos em manutenção, agradecemos a compreensão.</p>
        <p>&mdash; <B>Direção</B></p>
    </div>
  </div>
</article>
`;
```

Nesse ambiente estamos criando uma página HTML simples e você poderá editá-la conforme acharmos melhor, deixaremos simples pois será apenas para uso temporário enquanto estivermos realizando algum procedimento no qual o site não deve ficar disponibilizado para o público. 

Feito isso, basta clicar no botão `Salvar e Implantar` e partir para a configuração da rota. Para que a página venha a funcionar vamos precisar criar uma rota apontando para esse worker, para isso vamos em `Workers` > `Adicionar rota`, nessa tela você pode colocar um subdomínio, wildcard, caminho absoluto, faça de acordo com a sua necessidade. No nosso caso vamos deixar apenas para o nosso site principal e apontaremos para o nosso worker:

![cloudflare2](/assets/img/cloudflare-worker.png)

Pronto, basta que acesse o url configurado e verá que agora a página retornada será a de manutenção semelhante a essa:

![Cloudflare3](/assets/img/cloudflare3.png)

Espero que tenham gostado, até a próxima!