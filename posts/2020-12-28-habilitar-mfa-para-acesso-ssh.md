---
image: /assets/img/bash.png
title: Habilitar MFA para acesso ssh
description: Adicionar uma camada extra de segurança com autenticação de 2 fatores.
date: 2020-12-28
category: linux
background: "#EE0000"
tags:
  - linux
  - mfa
---
## Instalando o módulo

```
sudo yum install google-authenticator
```

Com o módulo instalado utilizamos o software que vem com o PAM para gerar a chave para o usuário que desejamos adicionar o segundo fator de autenticação. A chave é gerada individualmente para cada usuário, não sendo utilizada para todo o sistema.

### Configurando o OpenSSH

1. Adicionar a linha no final do arquivo e comente a linha `auth substack password-auth`

```
vim /etc/pam.d/sshd

auth required pam_google_authenticator.so nullok
```

1.1 Para adicionar exceções basta colocar o grupo do usuário no `/etc/pam.d/sshd` da seguinte forma
```
auth [success=done default=ignore] pam_succeed_if.so user ingroup GRUPO
```

2. Ajuste as seguintes variáveis no `/etc/ssh/sshd_config`

```
PasswordAuthentication no
ChallengeResponseAuthentication yes
AuthenticationMethods publickey,password publickey,keyboard-interactive
```

2.1 Caso seja necessário criar exceção para determinados usuários, basta adicionar o seguinte bloco na linha abaixo ao AuthenticationMethods `/etc/ssh/sshd_config`

```
Match User USUÁRIO
AuthenticationMethods publickey,password publickey
Match all
```
3. Reinicie o serviço SSH

```
systemctl restart sshd.service
```

### Criação de usuário

1. Gere a configuração do MFA com o seguinte comando:

```
google-authenticator
```

2 Ordem de respostas:

```
Do you want authentication tokens to be time-based (y/n) y
Do you want me to update your "/home/usuario/.google_authenticator" file (y/n) y
By default, tokens are good for 30 seconds. In order to compensate forpossible time-skew between the client and the server, we allow an extratoken before and after the current time. If you experience problems withpoor time synchronization, you can increase the window from its defaultsize of +-1min (window size of 3) to about +-4min (window size of 17 acceptable tokens). Do you want to do so? (y/n) n
If the computer that you are logging into isn't hardened against brute-forcelogin attempts, you can enable rate-limiting for the authentication module.By default, this limits attackers to no more than 3 login attempts every 30s.Do you want to enable rate-limiting (y/n)
```

3. Basta cadastrar o dispositivo com a secret key retornada e salvar os códigos de emergência para caso seja necessário acesso sem o dispositivo para gerar token.
