---
image: /assets/img/nginx-1.jpg
title: "Desmistificando o Nginx: parte 1"
description: NGINX é um software de código aberto para serviço da Web, proxy
  reverso, cache, balanceamento de carga, streaming de mídia e muito mais.
date: 2021-02-03
category: linux
background: "#EE0000"
tags:
  - Linux
  - Nginx
categories:
  - Linux
  - Nginx
---
Ele começou como um servidor web projetado para máximo desempenho e estabilidade. Além de seus recursos de servidor HTTP, o NGINX também pode funcionar como proxy para e-mail (IMAP, POP3 e SMTP) e um proxy reverso e load balancer para servidores HTTP, TCP e UDP.

Nesse cenário será utilizado o CentOs7 como sistema operacional, o processo de instalação pode variar dependendo da distribuição utilizada. 

# Instalação

As etapas neste tutorial requer que o usuário tenha privilégios de root.

1- Adicionar o repositório EPEL

```
yum install https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm
```

2- Instalar o Nginx

```
yum install nginx
```

3- Habilitar e iniciar

```
systemctl enable nginx
systemctl start nginx
```

4- Ajustar o firewall e SELinux
Caso utilize firewalld basta adicionar as seguintes regras:

```
sudo firewall-cmd --permanent --zone=public --add-service=http
sudo firewall-cmd --permanent --zone=public --add-service=https
sudo firewall-cmd --reload
```

Para que o nginx possa utilizar operar sem maiores problemas, é indicado que o libere também no SELinux, basta executar o comando:

```
semanage permissive -a httpd_t
```

Com o Nginx instalado e habilitado, vamos seguir com a configuração do mesmo.

# Configuração

Vamos abordar algumas configurações e opções que são úteis no dia a dia, para você que a administra um servidor Nginx e para os que estão migrando. 

### Criando um Vhost

Vamos utilizar o arquivo `.conf` padrão do nginx:

```
vim /etc/nginx/nginx.conf
```

Vamos limpar o arquivo `nginx.conf` e deixar apenas o esqueleto do nosso Vhost, utilizaremos o path default do Nginx para o exemplo:

```
events {}

http {

  include mime.types;

  server {

    listen 80;
    server_name 192.168.18.3;

    root /usr/share/nginx/html/;
  }
}
```

Configurado isso, vamos acessar o diretório `/usr/share/nginx/html`, pode remover todos os arquivos, vamos criar o nosso `index.html` apenas com um Hello World:

```
<!DOCTYPE html>
<html>
<head>
<title> Hello World Nginx! </title>
</head>
<body>
<h1> Hello World Nginx! </h1>
</body>
</html>
```

Feito isso, basta recarregar o nginx com o comando:

```
nginx -s reload
```

Pronto, colocando o ip da nossa máquina pelo navegador já deve ter o acesso sem problemas.

### Locations

O location é usado para definir como o Nginx deve lidar com solicitações de diferentes recursos e URLs para o servidor, conhecido como subpastas, dessa forma podemos definir o que acontece quando acessamos: `http://IP/Teste` se desejamos criar uma subpasta para ele ou se desejamos configurar regras.

Vamos criar uma location chamado Teste e informaremos a ela que deverá retornar o status code 200 e repassar na tela uma informação diferente do nosso Hello World inicial. Observe:

```
events {}

http {

  include mime.types;

  server {

    listen 80;
    server_name 192.168.18.3;

    root /usr/share/nginx/html/;

    location ^~ /Teste {
      return 200 'Hello World NGINX "/Teste" location.';
    }
  }
}
```

Após ajustado, realize o reload do nginx `nginx -s reload` e tente acessar o url: `http://IP/Teste`

### Variáveis

O Nginx possui algumas variáveis que podem ser configuradas para facilitar o gerenciamento de algumas informações, nos aprofundaremos mais na parte de proxy reverso, no qual aplicaremos algumas configurações no redirecionamento. 

O próprio Nginx possui uma página que reúne várias variáveis e as suas aplicabilidades basta [clicar aqui](http://nginx.org/en/docs/varindex.html).

Dessa forma, vamos criar uma location para retornar na tela algumas informações para inspecionarmos:

```
events {}

http {

  include mime.types;

  server {

    listen 80;
    server_name 192.168.18.3;

    root /usr/share/nginx/html/;

    location ^~ /Inspect{
      return 200 '$host\n$uri\n';
    }
  }
}
```

Feito isso, basta fazer o reload do nginx e acessar o url `http://IP/Inspect` verá que será retornado na tela algumas informações do host.

### Rewrites e Redirects

Os Rewries e Redirects são amplamente utilizados, um cenário para isso seria quando precisamos forçar que todas as requisições sejam feitas utilizando https, dessa forma realizamos um rewrite.

O redirecionamento simplesmente informa ao cliente para onde deverá ir o redireciona, por exemplo:

> O visitante acessa http://IP/redirect e o servidor redireciona o url movendo o visitante para o url http://IP/new-redirect

O Rewrite, faz o mesmo processo porém de forma interna e transparente, em poucas palavras, ele redirecionará e o url não será alterado.

Vamos ver algumas configurações de locations para cada cenário:

```
    location ^~ /Redirect{
      return 307 /Destino-Redirect;
    }

    location ^~ /Rewrite{
      rewrite ^/Rewrite/\w+ /Desino-Rewrite ;
    }
```

Quando acessado o url `/Redirect` veremos que a sua url será alterado para `/Destino-Redirect`. diferente no Rewrite, que por fazer o direcionamento de forma transparente para o usuário, redirecionará o acesso para `/Destino-Rewrite` porém irá manter o url `/Rewrite`.

Esse é o funcionamento básico de como funciona os redirecionamentos, existem outras formas e caso tenham interesse basta acessar o [link](https://www.nginx.com/blog/creating-nginx-rewrite-rules/).

### Logs

O Nginx grava registros de seus eventos em dois tipos de logs, logs de acesso e logs de erro. Os logs de acesso gravam informações sobre solicitações do cliente e os logs de erros gravam informações sobre os problemas do servidor e do aplicativo.

Para configurarmos os logs basta adicionar a diretiva e o caminho absoluto cujo o arquivo será gerado:

```
...
http {

    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;
...
```

Os logs também podem ser formatados, com a configuração da diretiva `log_format`, isso permite adaptar as informações que serão armazenadas no log, ou remover informações não necessárias, o mais comum e o padrão adotado é o `log_format combined` que reúne várias informações suficientes para análise.

Para mais informações sobre o log_format, basta acessar o [link](http://nginx.org/en/docs/http/ngx_http_log_module.html).

### Workers

O NGINX pode executar vários processos, cada um capaz de processar um grande número de conexões simultâneas. É possível controlar o número de workers e como eles lidam com as conexões com as seguintes diretivas:

`worker_processes`: O número de workers, o padrão é 1. Na maioria dos casos, a execução de um processo de trabalho por núcleo da CPU funciona bem, e recomendamos definir essa diretiva como automática para conseguir isso. Há momentos em que você pode querer aumentar esse número, como quando os processos de trabalho precisam fazer muita E/S de disco.

`worker_connections`: Essa diretiva define o número máximo de conexões que cada processo de trabalho pode manipular simultaneamente. O padrão é 512, mas a maioria dos ambientes possuim recursos suficientes para suportar um número maior.

Dessa forma vamos configurar o `worker_processes` como auto e ajustaremos a quantidade de conexões em 1024:

```
...
worker_processes auto;

events {
  worker_connections 1024;
}
...
```

Para não ficarmos com muito conteúdo e várias abordagens, vamos dar continuidade com a parte de Performance, Segurança e Proxy na parte dois desse artigo, espero que tenham gostado do material, tentei trazer o máximo de informações sobre as principais configurações que tenho tido vivencia.

Até a próxima.