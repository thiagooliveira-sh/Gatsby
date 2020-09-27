---
image: /assets/img/mod_deflate-cpanel-secnet-868x488.jpg
title: Instalacao do cPanel no CentsOs7
description: >-
  cPanel é o painel de controle mais popular e mais usado para gerenciar e
  automatizar tarefas de hospedagem na web.
date: '2020-09-27'
category: linux
background: '#EE0000'
tags:
  - Linux
  - cpanel
---
É o painel de controle mais intuitivo e fácil do mundo, com uma interface gráfica muito simples e direta. O cPanel é um painel de controle de hospedagem na web baseado em Linux, que utiliza uma estrutura de nível 3 para administradores de sistemas, revendedores e proprietários de sites de usuários finais, tudo por meio de um navegador da web. 

Além da bela interface de usuário, o cPanel tem acesso à linha de comando e acesso baseado em API para integração de software de terceiros, para provedores de hospedagem web ou desenvolvedores e administradores automatizarem seus processos de administração do sistema. Neste tutorial, mostraremos a você como instalar o WHM e o cPanel no CentOS 7.

Requisitos de instalação do cPanel

* CentOS 7 VPS
* Mínimo de 1GB RAM (2GB RAM é recomendado)
* Espaço mínimo em disco 20GB (40GB recomendado)
* Licença do cPanel (também há o período experimental 15 que é ativado assim que a instalação é concluída)

### Instalação

O Cpanel é escrito em Perl, portanto, antes de iniciarmos a instalação, você deve certificar-se de ter o Perl e o curl instalado em seu servidor.

```
yum install perl
 curl
```

O WHM / cPanel também exige que o nome do host do seu servidor seja um nome de domínio totalmente qualificado (FQDN) que não corresponda a nenhum dos domínios do servidor. Em nosso exemplo, definiremos o nome do host do nosso servidor como host.mydomain.com (você pode substituir mydomain.com pelo seu nome de domínio real). Para alterar o nome do host do seu servidor, você pode usar o seguinte comando:

```
hostnamectl set-hostname server.thiagoalexandria.com.br
```

Agora você pode baixar a última versão do cPanel & WHM com:

```
Curl -o latest -L https://securedownloads.cpanel.net/latest
chmod +x latest
./latest
```

Finalizado a instalação você conseguirá abrir seu navegador e navegar para https://your-server-ip:2087 e terá acesso a página de login ao WHM, para entrar basta colocar o user root e a sua respectiva senha.

### Configuração

Assim que feito o primeiro login, você terá de realizar algumas configurações iniciais, na tela inicial será cobrado informações como :

* Confirmação do hostname do servidor
* Endereços para recebimento dos alertas
* Servidores DNS
* Qual o serviço DNS o servidor utilizará ( Se não irá como servidor DNS basta desativar)

Pronto, após feito todo o passo a passo o WHM/cPanel estará disponível para utilização, basta seguir com a criação das suas contas de hospedagens e seguir com a criação do seu site. 

### Bônus

Para forçar a atualização do cPanel basta executar o seguinte comando, ele irá verificar quaisquer atualização disponível e irá aplica-la no servidor:

```
/usr/local/cpanel/scripts/upcp
```

Para os que desejam focar na administração do servidor cPanel outra opção bastante interessante é a utilização do cPanel/WHM através da API, segue o link da documentação oficial do cPanel referente a [WHM API ](https://documentation.cpanel.net/display/DD/Guide+to+WHM+API+1)e [cPanel API](https://documentation.cpanel.net/display/DD/Guide+to+cPanel+API+2).

Espero que tenham gostado do conteúdo, em breve pretendo trazer mais posts relacionado ao cPanel e a automação de atividades utilizando a linha de comando.
