---
title: Git para iniciantes
description: >-
  Esse artigo é algo introdutório, o básico para começar a operar com git e
  repositórios remotos
date: '2020-01-16 10:50:33'
category: dev
background: '#EB7728'
---
Esse artigo é algo introdutório, o básico para começar a operar com git e repositórios remotos, nesse exemplo será utilizado o GitHub porém sinta-se livre para utilizar a plataforma que tiver mais vivência.

Primeiramente realize o download e a instalação do git em sua estação de trabalho, após a instalação, inicie o “git bash” se for windows ou o seu terminal, se for linux, partiremos então para configuração inicial, inserindo seu nome e e-mail (email do github)

```bash
git config --global user.name “Seu Nome”
git config --global user.email “seu@email.com”
```

Após a configuração global, vamos agora criar uma chave SSH para acesso no GitHub, no próprio terminal insira os comandos a seguir:

```bash
ssh-keygen -t rsa -b 4096 -C seu@email.com;
Generating public/private rsa key pair.
Enter a file in which to save the key (/c/Users/usuario/.ssh/id_rsa):[Aperte Enter]
Enter passphrase (empty for no passphrase): [Aperte Enter]
Enter same passphrase again: [Aperte Enter]
```

Após a criação da chave SSH vamos copiar o arquivo gerado para inserir como chave no nosso GitHub para isso vamos entrar na referida chave

```bash
cd .ssh/
cat id_rsa.pub
```

Copie todo o conteúdo contido nesse arquivo (exemplo de arquivo abaixo)

```bash
ssh-rsa
AAAAB3NzaC1yc2EAAAADAQABAAACAQDBcakNkMSLIlMluPzhlT7fbVaUFTglGa6RGbT9d39wz3wtO7
m63GBWQCSlKuVm/rMPa3mYS9x1TZXCKCYPWznAjOwZC3ufo4HbiwKVXju8RH153m9qWa7oaBu7d
dB
Bxcim17DgGFi3NuzJSBwyKvIx08r3QkpKboS1AAA7KZZx/4636zy9CXn2zuqpG2Ji0KfHIjBunVemC
nsOLDGyPcnMLfo5ZJzi3lcMpViWn1xsg76HbjykMI+qZ/PFRkPUXGNa69rWUJeN8Nb2IIwMhM6kdlj
CtL3uczuv2sG5ZCq2rgNe+pnZUZXmpPXda/Ynm5CxdoskN5B9QNf/YK/GMIfyh4OZnS+kwvRTG0fCp
NLYSNw4E53vjOU7YXkLVhxruxg+7sDb37On6X8JZ1tXiVgLERvFfwArtESKeq8ybDsdfCmgKfHiONS
IxoLtfjxMwAW/t+9xfgYbH4Mj6kIPQMBkSr1VUQmM5PljUePFPY0/c4WpFQkJBqEbUDJZJk02OjMMd
MsHxUUTl1y2Hv0fFcGW/J5Hx2LrU+1oFktS9HaTb5AuIPGUi5UkxFQ12dx0iLn0PGUZ1oUmD8AK5E6
GYjKIMHF/mrT5I5YZv1Z4mJYL0W5C9JI7DWd5GrrE3GdBXSWvXw8Sa6U795w98+3mf10CW00UoE6s8
PpVXn18m15dw== seu@email.com
```

Acessando o site [](https://github.com/)[GitHub ](https://github.com/)em configuração “settings” existirá uma opção chamada *“SSH GPG KEYS”* em *“ADD NEW SSH KEY”* você insere o nome da sua máquina “Máquina Trabalho” e a chave SSH logo em seguida. Após a criação da chave SSH e inserção da mesma no git vamos testar para validar a chave, volte para o terminal e realize o devido comando:

```bash
ssh -T git@github.com
# Attempts to ssh to GitHub
The authenticity of host &#39;github.com (IP ADDRESS)&#39; can&#39;t be established.
RSA key fingerprint is 16:27:ac:a5:76:28:2d:36:63:1b:56:4d:eb:df:a6:48.
Are you sure you want to continue connecting (yes/no)?[DIGITE yes]
Hi username! You've successfully authenticated, but GitHub does not
provide shell access.
```

Pronto com a chave SSH criada e conexão com o GitHub estabelecida vamos a alguns comandos básicos, para clonar um repositório criado no GitHub vamos primeiro no repositório e clicamos em *"clone or download"*

Vamos então escolher o destino da pasta que será clonada e seguimos com a realização do seguinte comando para clonagem:

```bash
git clone git@github.com:usuario/pasta.git
```

Feito isso a pasta foi clonada para o caminho configurado, pelo terminal de comando acessaremos a pasta:

```bash
cd pasta/
```

Para começar a usar o git é necessário a adição de novos arquivos e diretórios, dessa forma, basta seguir com a criação dos arquivos e após feito executar o seguinte comando:

```bash
git add .
```

Para commitar arquivos modificados realizamos o seguinte comando:

```bash
git commit -am “comentário sobre modificações”
```

Para enviar os arquivos modificados para o repositório realizamos o seguinte comando:

```bash
git push -u origin master
```

Para atualizar os arquivos locais para os atuais do GitHub realizamos o seguinte comando:

```bash
git pull
```

Até a próxima!
