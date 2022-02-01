---
image: /assets/img/AWS.png
title: Permitir conexões SSH por meio do Session Manager
description: Você pode permitir que usuários em seu Conta da AWS para usar o AWS
  CLI para estabelecer conexões SSH com instâncias usando SSM.
date: 2022-02-01
category: aws
background: "#FF9900"
tags:
  - AWS
  - SSM
  - SSH
  - Security
categories:
  - AWS
  - SSM
  - SSH
  - Security
---
Os usuários que se conectam usando SSH também podem copiar arquivos entre suas máquinas locais e as instâncias gerenciadas usando o comando SCP. Você pode usar essa funcionalidade para se conectar a instâncias sem abrir a necessidade de abrir portas, VPC ou manter bastion hosts.

Para que isso seja possível precisamos primeiro realizar a instalação do Session Manager plugin na sua máquina, dessa forma basta que realize a instalação baseada no seu sistema [operacional](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-working-with-install-plugin.html).

# Configuração

Atualize o arquivo de configuração do seu SSH para permitir que executemos um comando por proxy que vai iniciar uma sessão pelo Session Manager e permitir que tenha trafego de informações por essa conexão.

Crie o arquivo de config da seguinte forma:

```
vi ~.ssh/config.
```

Dentro dele basta inserir o seguinte conteúdo:

```
# SSH over Session Manager
host i-* mi-*
    ProxyCommand sh -c "aws ssm start-session --target %h --document-name AWS-StartSSHSession --parameters 'portNumber=%p'"
```

# Criando uma sessão

Para iniciar uma sessão, você utilizara o comando SSH normalmente e a configuração ajustada acima irá fazer o proxy para o SSM:

```
ssh -i minha-chave.pem username@instance-id
```

Observe:

![ssm-ssh](/assets/img/ssm-ssh-1.png)

Da mesma forma, se precisarmos enviar um arquivo via SCP vamos realizar da seguinte forma:

```
scp -i minha-chave.pem arquivo-1.txt usrname@instance-id/home/ec2-user/
```

Observe:

![ssm-scp](/assets/img/ssm-ssh-2.png)


Bom, essa é uma forma alternativa para que possamos acessar as nossas instâncias na AWS, espero que gostem!