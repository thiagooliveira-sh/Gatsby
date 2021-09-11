---
image: /assets/img/AWS.png
title: Como configurar um bucket para aceitar apenas conexoes HTTPS
description: O Amazon S3 oferece criptografia  in transit e criptografia at
  rest. Criptografia  in transit refere-se a HTTPS e criptografia at rest
  refere-se a criptografia do lado do cliente ou do lado do servidor.
date: 2021-09-10
category: aws
background: "#FF9900"
tags:
  - aws
  - s3
  - seguranca
  - iam
  - ""
categories:
  - aws
  - s3
  - seguranca
  - iam
  - ""
---
Por padrao o S3 aceita requisiçoes HTTP e HTTPS, por outro lado todos os serviços interno da amazon dao preferencia a utilizacao por HTTPS, por exemplo o AWS CLI ao chamar algum servico utilizara sempre o endpoint seguro com TLS/SSL.

Dessa forma, para que tenhamos a garantia de que o acesso aos nosso buckets possuam uma segurança durante o trafego, in transit, precisamos fazer com que ele de preferencia apenas para HTTPS e passe a negar a utilizacao por HTTP.

Sabendo disso, vamos elaborar um Bucket policy que ira restringir o acesso inseguro, aceitando apenas quando recebido por HTTPS.

### 1. Criar um bucket

Nesse passo nao tem misterio, basta que acesse o console do s3 e realize a criaçao de um bucket permitindo o acesso externo, precisamo do acesso externo para exemplificar o bloqueio por parte da politica. Utilizaremos um bucket ficticio chamado `lab-s3-http`.

### 2. Ajustar o bucket policy

Apos criar o bucket, acesse a aba de `Permissions` e la procure por `Bucket policy` em seguida clique em `Edit`.

Pronto, com o editor aberto, precisamos criar uma policy da seguinte forma:

```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "SecureTransport",
            "Effect": "Deny",
            "Principal": "*",
            "Action": "s3:*",
            "Resource": [
                "arn:aws:s3:::lab-s3-http",
                "arn:aws:s3:::lab-s3-http/*"
            ],
            "Condition": {
                "Bool": {
                    "aws:SecureTransport": "false"
                }
            }
        }
    ]
}
```

O que essa politica faz?

A regra de `SecureTransport` ira bloquear qualquer acao que venha a ser realizada para o bucket em questao cujo a flag de SecureTransport venha como false, ou seja tudo que vir por meio de HTTP nao sera aceito pela policy.

OBS: Lembre-se de no bloco de `Recource` alterar os recursos para o nome do seu bucket.

### 3. Testar o acesso

Para realizar o teste e validar que o bucket so encontra-se disponivel atraves de HTTP dessa forma, faça o upload de um arquivo dentro do bucket e apos feito copie a url de acesso inserindo no navegador o `https://` e observe que o bloqueio retornara na tela uma mensagem semelhante a essa:

Teste agora o acesso utilizando https e veja que o mesmo url abre a imagem:


### 4. Utilizar o AWS Config para monitorar os buckets

Podemos utilizar o AWS Config para monitorar a nossa infraestrutura caso fuja do padrao de compliance que desejamos, dessa forma podemos criar uma Config baseada na politica ja existente da amazon chamada `s3-bucket-ssl-requests-only`.

Voce pode incrementar o config adicionando uma ação de correção que lhe notifique por e-mail através do `SNS` quando um bucket for identificado como fora de conformidade.

Espero que tenham curtido a ideia e habilitem nos buckets de voces!

