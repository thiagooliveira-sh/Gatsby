---
image: /assets/img/AWS.png
title: Acessando uma EC2 atraves do SSM
description: O Session Manager permite que você estabeleça conexões seguras para
  as instâncias EC2
date: 2021-11-06
category: aws
background: "#FF9900"
tags:
  - SSM
  - AWS
  - EC2
categories:
  - SSM
  - AWS
  - EC2
---
## Oque é o Session Manager

## Configurar o Session Manager

O Session Manager oferece suporte a Linux, MacOS e Windows Server 2012 até o Windows Server 2019, sabendo disso vamos precisar seguir alguns passos para que possamos utilizar o AWS SSM em nossa EC2.

#### 1. Criar uma IAM Role com acesso ao SSM

Acesse o painel de gerencimaento do **`IAM`** e selecione a opçao **`Roles`** em seguida seleciona a opçao **`Create Role`**.

![](/assets/img/create-role.png)

Precisamos criar uma role baseada em serviços entao selecione a opcao **`AWS Services`** e busque por **`Ec2`** e **`Next`**.

Agora busque pela police gerenciada pela Amazon chamada `AmazonEC2RoleforSSM` e Next.

![](/assets/img/police-role.png)

Adicione as tags conforme sua organizaçao determina e em seguida de um nome para sua role, nesse caso coloquei o nome de `Ec2RoleSSM`.

![](/assets/img/review-role.png)

#### 2. Atachar a role em uma EC2

Pelo console da Amazon, acesse o painel de instancias dentro de EC2, la voce encontrara todas sa suas instancias:

![](/assets/img/lista-instancia.png)

Selecione a instancia com botao direito e selecione` Security > Modify IAM Role`

![](/assets/img/atach-role.png)

Selecione a IAM Role que criamos anteriormente e aplique. 

#### 3. Instalar o Agent

Em instancias que nao Amazon Linux e necessario que instalemos o SSM Agent para que a partir dai possamos gerar uma sessao pelo console da Amazon utilizando o SSM.

Nesse ponto, existem duas possibilidades, você pode criar uma instância EC2 configura-la com o SSM e a partir dela gerar uma AMI para sempre que lançar uma nova EC2 a partir dessa AMI ja ter as configurações de SSM instaladas, ou sempre que lançar uma AMI do marketplace acessar primeiro por SSH e instalar os pacotes necessários.

Vamos realizar o processo de configuração em uma instância Ubuntu recem criada a partir de uma imagem do marketplace.

##### 3.1. Acesse a instancia por SSH

Utilize um cliente SSH para acessar a instancia utilizando a private key que definimos durante a criaçao da instancia, por exempo:

```
ssh ubuntu@ec2-3-239-56-227.compute-1.amazonaws.com -i thiagoalexandria.pem
```

##### 3.2. Instale o ssm agent

Nesse exemplo estamos utilizando o ubuntu, porem nao precisa se preocupar o processo e bem semelhante, basta seguir com a instalaçao baseada no seu sistema operacional atraves da documentaçao. Pelo Ubuntu basta instalar utilizando o `snap`, da seguinte forma:

```
sudo snap install amazon-ssm-agent --classic
```

##### 3.3. Habilite e inicie o serviço

No ubuntu, como observado, temos alguma mudanças na forma com que o serviço e chamado devido a instalaçao ocorrer pelo snap. Dessa forma segue abaixo os comandos para gerencia-lo pelo `systemctl`.

```
systemctl start snap.amazon-ssm-agent.amazon-ssm-agent.service
systemctl status snap.amazon-ssm-agent.amazon-ssm-agent.service
systemctl stop snap.amazon-ssm-agent.amazon-ssm-agent.service
```

Outra forma e gerencia-lo pelo `snap`:

```
snap services amazon-ssm-agent
snap list amazon-ssm-agent
snap start amazon-ssm-agent
snap restart amazon-ssm-agent
```

##### 3.4. Acesse a instancia pelo SSM

Pronto, agora basta seleciona a instancia e clicar em `Connect`, feito isso sera redirecionado para o painel no qual voce podera escolher a forma de conexao, selecione o **`Session Manager`** e `Connect`.

![](/assets/img/ssm-2.png)

![](/assets/img/ssm-1.png)

## Trabalho com Session Manager

## Auditoria de atividade

## Soluçao dos principais problemas com SSM