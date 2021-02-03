---
image: /assets/img/nginx-1.jpg
title: Desmistificando o Nginx
description: NGINX é um software de código aberto para serviço da Web, proxy
  reverso, cache, balanceamento de carga, streaming de mídia e muito mais.
date: 2021-02-02
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

### Variabeis

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

```
Cliente acessa http://IP/redirect o servidor redireciona o url movendo o cliente para o url http://IP/new-redirect
```

O Rewrite, faz o mesmo processo porém de forma interna e transparente, em poucas palavras, ele redirecionará e o url não será alterado.

### Logs

### Workers

### Modulos dinâmicos

# Performance

### Headers

### Gzip

### HTTP2

# Segurança

### HTTPS

### Rate Limit

### Hardening

# Proxy reverso e Load Balancing

### Proxy Reverso

### Load Balancer