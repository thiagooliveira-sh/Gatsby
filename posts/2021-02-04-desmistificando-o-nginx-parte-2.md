---
image: /assets/img/nginx-1.jpg
title: Desmistificando o Nginx parte 2
description: Daremos continuidade com o nosso estudo sobre o Nginx, abordando
  performance, segurança e proxy.
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
# Performance

Existem diversos pontos que podem gerar performance no servidor web, abordaremos alguns dos mais importantes e comuns. 

### Headers

Os servidores Web não controlam o client-side caching, obviamente, mas eles podem emitir recomendações sobre o que e como armazenar o cache, na forma de cabeçalhos de resposta HTTP.

Podemos adicionar um header e expires, que foi projetado como uma solução rápida, e também o novo cabeçalho Cache-Control que oferece suporte a todas as maneiras diferentes de funcionamento de um cache HTTP.

Digamos que temos uma imagem ou uma foto em nosso site e queremos dizer que os dados das fotos não mudam com frequência, dessa forma podemos dizer ao navegador que podem armazenar em cache uma copia por um tempo relativamente longo.

Vamos então configurar que todas as imagens `jpg` e `png` recebam algumas configurações de header, primeiro definimos que o cabeçalho de `Cache-Control` como público, informando ao cliente de recebimento que esse recurso ou resposta pode ser armazenados em cache de qualquer forma.

Em seguida configuramos o pragma também para publico, esse header é apenas uma versão mais antiga do `Cache-Control`, é interessante que configuremos. 

O cabeçalho `Very` significa que o conteúdo dessa resposta pode variar com o valor que esta sendo codificado, vamos abordar melhor essa configuração ainda nesse artigo, mas basicamente informa que a resposta pode variar com base no valor do cabeçalho da solicitação, exceto na codificação.

Finalmente vamos configurar a tag `expires` que pode ser configurado definindo uma data ou uma duração padrão, por exemplo 60M que seria 60 minutos.

````
    location ~* \.(jpg|png)$ {
      access_log off;
      add_header Cache-Control public;
      add_header Pragma public;
      add_header Vary Accept-Encoding;
      expires 60M;
    }
````

Dessa forma configuramos as tags de header e o de expiração para 60 minutos, forçando o cache local dessas informações das imagens. 

### Gzip

Você precisa usar o módulo ngx_http_gzip_module. Ele compacta todas as respostas HTTP válidas (arquivos) usando o método “gzip”. Isso é útil para reduzir o tamanho da transferência de dados e acelerar as páginas da web para ativos estáticos como JavaScript, arquivos CSS e muito mais.

Faremos uma configuração simples, habilitando e definindo alguns tipos de arquivos que podem ser compactados:

````
http{
...

  gzip on;
  gzip_comp_level 3;

  gzip_types text/css;
  gzip_types text/javascript;

...
}
````

Para habilitar basta configurar a diretiva `gzip on`, podemos definir o nível da compactação, de 1 a 9, quanto maior mais ele vai tentar compactar, um valor aceitável é o `3` em `gzip_comp_level`.

Para definir os tipos que serão compactados defina com a diretiva `gzip_types`.

### HTTP2

A partir da versão 1.9.5 do Nginx tornou-se possível a configuração do http2, para isso é necessário que tenhamos um certificado ssl em nosso servidor, não cobriremos a geração ou compra do certificado, partiremos da pressuposição de que você já tenha um.

Para habilitar a versão basta configurarmos o listener na porta 443 para uma conexão segura e nele informamos a nova versão:

```
http {

  include mime.types;

  server {

    listen 443 ssl http2;
...
```

Como informado, para configuração do acesso com ssl, é necessário definir o caminho dos certificados:

````
    ssl_certificate /etc/nginx/ssl/self.crt;
    ssl_certificate_key /etc/nginx/ssl/self.key;
````

# Segurança

### HTTPS

````
  server {

    listen 443 ssl http2;

    ssl_certificate /etc/nginx/ssl/self.crt;
    ssl_certificate_key /etc/nginx/ssl/self.key;

    # Disable SSL
    ssl_protocols TLSv1 TLSv1.1 TLSv1.2;

    # Optimise cipher suits
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDH+AESGCM:ECDH+AES256:ECDH+AES128:DH+3DES:!ADH:!AECDH:!MD5;

    # Enable DH Params
    ssl_dhparam /etc/nginx/ssl/dhparam.pem;

    # Enable HSTS
    add_header Strict-Transport-Security "max-age=31536000" always;

    # SSL sessions
    ssl_session_cache shared:SSL:40m;
    ssl_session_timeout 4h;
    ssl_session_tickets on;
````

### Rate Limit

### Hardening

# Proxy reverso e Load Balancing

### Proxy Reverso

### Load Balancer