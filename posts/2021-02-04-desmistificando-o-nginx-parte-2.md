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

```
    location ~* \.(jpg|png)$ {
      access_log off;
      add_header Cache-Control public;
      add_header Pragma public;
      add_header Vary Accept-Encoding;
      expires 60M;
    }
```

Dessa forma configuramos as tags de header e o de expiração para 60 minutos, forçando o cache local dessas informações das imagens. 

### Gzip

### HTTP2

# Segurança

### HTTPS

### Rate Limit

### Hardening

# Proxy reverso e Load Balancing

### Proxy Reverso

### Load Balancer