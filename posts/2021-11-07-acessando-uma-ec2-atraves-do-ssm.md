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

#### 2. Atachar a role em uma EC2

#### 3. Instalar o Agent

Em instancias que nao Amazon Linux e necessario que instalemos o SSM Agent para que a partir dai possamos gerar uma sessao pelo console da Amazon utilizando o SSM.

Nesse ponto, existem duas possibilidades, você pode criar uma instância EC2 configura-la com o SSM e a partir dela gerar uma AMI para sempre que lançar uma nova EC2 a partir dessa AMI ja ter as configurações de SSM instaladas, ou sempre que lançar uma AMI do marketplace acessar primeiro por SSH e instalar os pacotes necessários.

Vamos realizar o processo de configuração em uma instância CentOs recem criada a partir de uma imagem do marketplace.

##### 1. Acesse a instancia por SSH 
##### 2. Instale o ssm agent
##### 3. Habilite e inicie o serviço
##### 4. Acesse a instancia pelo SSM


## Trabalho com Session Manager

## Auditoria de atividade

## Soluçao dos principais problemas com SSM
