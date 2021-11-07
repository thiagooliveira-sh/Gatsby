---
image: /assets/img/AWS.png
title: "Processo de criptografia de EBS "
description: Vários serviços da Amazon oferece o serviço de criptografia em
  repouso e não é diferente com o EBS, utilizando o KMS, com isso todo snapshot
  criados a partir de uma EBS criptografada também será criptografado.
date: 2021-11-07
category: aws
background: "#FF9900"
tags:
  - aws
  - ebs
  - kms
  - criptografia
  - ec2
categories:
  - aws
  - ebs
  - kms
  - criptografia
  - ec2
---
Quando você cria um volume do EBS criptografado e o anexa a um tipo de instância com suporte, os seguintes tipos de dados são criptografados:

* Dados em repouso dentro do volume
* Todos os dados que são movidos entre o volume e a instância
* Todos os snapshots criados a partir do volume
* Todos os volumes criados a partir desses snapshots

Antes de mais nada, habilite a criptografia padrão de volumes, novos volumes criados a partir de entao ja surgem com a criptografia por padrao.

#### 1. Acesse o Ec2 dashboard.
#### 2. Em Account Attributes selecione a opçao EBS encryption.
#### 3. Clique em Manage e em seguida enable.


# Criptografar recursos não criptografados

Não é possível criptografar diretamente volumes ou snapshots não criptografados. No entanto, você pode criar volumes ou snapshots criptografados a partir de volumes ou snapshots não criptografados.

# Criptogrando volumes não criptografados

#### 1. Acesse o console e vá até a opção **`EC2 > Volumes`**

#### 2. Observe que existe uma coluna com o nome **Encryption** lá será possível analisar os volumes que não estão criptografados.

![listagem.png](/ops/infraestrutura/processos/aws/criptografia-ebs/listagem.png)

#### 3. Selecione o disco que será criptografado e em seguida clique com o botão direito e **Create snapshot**

> OBS: coloque uma tag com o nome do snapshot para facilitar a busca.

![criar-snapshot.png](/ops/infraestrutura/processos/aws/criptografia-ebs/criar-snapshot.png)

![criar-snapshot2.png](/ops/infraestrutura/processos/aws/criptografia-ebs/criar-snapshot2.png)

#### 4. Acesse agora o menu **`EC2 > Snapshots`** e busque pelo snapshot gerado.

#### 5. Selecione com botão direito e selecione a opção **`Create Volume`**.

![criar-volume.png](/ops/infraestrutura/processos/aws/criptografia-ebs/criar-volume.png)

#### 6. Nessa etapa as opções de criptografia vao ser preenchidas automaticamente, um ponto de atenção é escolher a **`Availability Zone`** identica ao do volume que irá ser substituido.

![criar-volume2.png](/ops/infraestrutura/processos/aws/criptografia-ebs/criar-volume2.png)

#### 7. Com o volume criado e disponível para uso, você precisa desligar a máquina Ec2.

![Interromper-instancia.png](/ops/infraestrutura/processos/aws/criptografia-ebs/interromper-instancia.png)

#### 8. Acesse o menu **`EC2 > Volumes`** e filtre pelos volumes criado e utilizado pela maquina.

![listar-volumes.png](/ops/infraestrutura/processos/aws/criptografia-ebs/listar-volumes.png)

#### 9. Anote o "`Attachment information`" disponível nas informações do volume atachado na Ec2 para que possamos utilizar com o novo volume:

![mount-point.png](/ops/infraestrutura/processos/aws/criptografia-ebs/mount-point.png)

#### 10. Desatache o disco e atache o volume criptografado

![add-volume.png](/ops/infraestrutura/processos/aws/criptografia-ebs/add-volume.png)

#### 11. Ligue a Ec2.

# Considerações

Uma vez que o processo causa downtime no ambiente, é indicado que realize o mesmo fora do horário comercial e com Gmud aprovada.