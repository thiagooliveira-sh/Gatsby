---
image: /assets/img/bash.png
title: Crie e hospede o seu próprio Linktree
description: "O Linktree é uma ferramenta bastante utilizada para centralizar
  links para as suas plataformas. "
date: 2021-04-08
category: dev
background: "#EB7728"
tags:
  - dev
categories:
  - dev
---
Essa publicação será um pouco diferente, apesar do foco não ser a área de desenvolvimento, achei bacana trazer esse conteúdo. 

O Linktree é uma ferramenta que permite ao usuário centralizar e divulgar os links de todas as suas redes sociais. Ela costuma ser muito utilizada por influenciadores digitais para divulgar outras redes e por empresas, que inserem os sites para venda de seus produtos.

Talvez um ponto negativo é que para algumas funções precisamos seguir com a contratação dos planos. Estava pensando em criar um então decido eu mesmo fazer.

Nesse post aprenderemos a criar o nosso próprio linktree e também como hospeda-lo inteiramente de graça através do Github Pages dessa forma você poderá personalizar a url para o seu próprio domínio.

### Ingredientes

* Precisaremos que você possua uma conta ativa no github
* Conhecimentos mínimos de html para ajustar o projeto
* Um domínio

### Iniciando o projeto.

Vocês podem fazer um fork, clonar ou criar a partir do meu projeto no github, nesse [link](https://github.com/thiagoalexandria/own-link).

Feito isso, vamos entender os arquivos:

```
.
├── CNAME
├── images
│   ├── favicon.png
│   └── thiago.jpeg
├── index.html
└── style.css
```

* `CNAME` = Vocês podem limpar ou remover esse arquivo, ele é gerado automaticamente quando definimos o url personalizado;
* `images` = Será o diretório cujo armazenaremos o favicon e a foto do nosso avatar;
* `index.hml` = arquivo principal contendo a estrutura do nosso linktree;
* `style.css` = arquivo de estilo para caso precise alterar as cores.

Vamos então ao que interessa, faça o upload das suas imagens e partiremos então a estrutura do nosso index.

### Index

No index, inicialmente, você precisa ajustar os apontamentos das suas imagens e o titulo do seu site:

```html
7  <link rel="shortcut icon" type="image/jpg" href="images/favicon.png"/>
...
13 <title>Thiago Alexandria</title>
...
36 <img src="images/thiago.jpeg" alt="Pic" class="profile-pic" />
```

Ajustado os apontamentos, vamos entender como funciona o nosso linktree. Ele basicamente é composto por uma list cujo inserimos os links que desejamos.

A lista começa logo em seguida da tag `<div class="link-list">` na linha `39`. Observe um bloco padrão dessa lista:

```html
<a
 href="https://thiagoalexandria.com.br/"
 target="_blank"
 rel="noopener noreferrer"
>
  <div class="link-list-item dark">
      Thiago Alexandria
  </div>
</a>
```

Dessa forma, basta informar o campo `href` o url que será o target, e na `div` que possui a classe `link-list-item` informe o nome que será exibido na link, pode ser o seu nome, o nome da rede social ou qualquer outra coisa. 

Crie toda a sua estrutura de links, vou colocar abaixo um exemplo de um linkbio de 2 elementos para fixar melhor a forma com que deve ser feito:

```html
<a
 href="https://thiagoalexandria.com.br/"
 target="_blank"
 rel="noopener noreferrer"
>
  <div class="link-list-item dark">
      Thiago Alexandria
  </div>
</a>

<a
 href="https://github.com/thiagoalexandria"
 target="_blank"
 rel="noopener noreferrer"
>
  <div class="link-list-item dark">
      Github
  </div>
</a>
```

Entendido como funciona a distribuição dos itens, vamos a personalização.

### Estilo

Temos três tonalidades para aplicarmos aos itens, se observar configuramos a nossa `div` de itens com a classe `dark`. No nosso arquivo de estilo temos as opções `dark`,`medium` e `light` que pelo nome temos a noção que trata-se da intensidade da cor do nosso item.

Para mudar a intensidade que a ser utilizada, basta trocar na linha da div onde temos `dark` para o da sua preferencia. Caso queira ir além e criar a sua própria paleta de cores, você pode editar o seu arquivo `style.css` e ajustar as seguintes variáveis

```css
:root {
	--darkest-color: #3b3b3b;
	--lightest-color: #eaf6de;
	--highlight-color: #ffffff;
	--bright-color-1: #1dd845;
	--bright-color-2: #76c47a;
	--bright-color-3: #7fff7f;
}
```

* `darkest-color` = Cor do body da sua página
* `lightest-color` = Cor das bordas
* `highlight-color` = Cor que aparecerá quando passamos por cima dos links
* `bright-color-1` = Cor `dark`
* `bright-color-2` = Cor `medium`
* `bright-color-3` = Cor `light`

Pronto, praticamente você já sabe personalizar e mudar todo o projeto com intuito de criar o seu próprio linktree, vamos então hospeda-lo.

### Hospedagem

Para a hospedagem, vamos partir do pressuposto de que você possui um domínio e uma conta no Github. 

1. Primeiro crie um novo repositório e faça o upload do projeto nele.
2. Feito a criação, acesse as opções do repositório e busque por "Github Pages" 

![githubpages1](/assets/img/pages1.png)

3. Em source`  defina a branch do projeto, geralmente será a master e clique em save, você terá algo semelhante a isso:

![](/assets/img/pages2.png)

Observe que ele informará o url do seu site, como nós vamos utilizar um domínio personalizado, vamos primeiro pegar os IPs que respondem pelo nosso domínio. Para isso o Github indica que peguemos da seguinte forma.

```
dig <GITHUB-USER>.github.io
```

Será retornado em torno de 4 endereços, pegue-os e crie a entrada de subdomínio na sua zona DNS, no nosso caso criei o subdomínio linkbio.thiagoalexandria.com.br e realizei os devidos apontamentos. 

Por ultimo voltamos as configurações do nosso repositório e vamos até a opção `custom domain` e inserimos o nosso domínio personalizado.

Pronto, basta esperar a propagação DNS do seu provedor e realizar os acessos, indico fortemente a utilização do Cloudflare para uma rápida propagação e suporte a CDN.

Espero que tenham curtido esse modelo de artigo, e que consigam criar os seus próprios linktree inteiramente personalizável.