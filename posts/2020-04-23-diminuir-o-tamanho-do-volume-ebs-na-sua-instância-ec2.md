---
image: /assets/img/AWS.png
title: Diminuir o tamanho do volume EBS na sua instância EC2
description: >-
  Talvez você esteja se perguntando, podemos diminuir o tamanho do volume do
  EBS? A resposta é não. É impossível diminuir o tamanho do volume do EBS.
  Quando você tem 100GB de EBS e decide modificá-lo para 30GB, você receberá um
  erro. Mas não precisa se preocupar, existe uma forma de burlamos isso e
  aplicar reduções utilizando um disco menor.
date: '2020-04-22'
category: aws
background: '#FF9900'
tags:
  - AWS
categories:
  - AWS
---

A Amazon não permite a redução de disco, por motivos obvies ligado ao mapeamento dos dado dentro da estrutura de armazenamento. Porém existe uma forma de clonarmos e substituir o disco por um de menor capacidade, existem duas formas de fazermos isso, é um procedimento um pouco complexo. 

Nesse primeiro artigo iremos abordar uma das formas de substituição, posteriormente irei falar mais sobre uma outra forma para ambientes um pouco mais complexos, vamos lá:

1. Realizar um Snapshot do volume original.
2. Criar um novo e menor volume EBS.
3. Conectar o novo volume.
4. Formatar o novo volume.
5. Montar o novo volume.
6. Copiar os dados do volume antigo para o novo.
7. Preparar o novo volume.
8. Desmontar os volume e desconectar.  
9. Substituir o novo volume na instancia.

### Antes de iniciar

Supomos que o ambiente que sofrerá a intervenção esteja disposta da seguinte forma

1. Uma instancia chamada `resize-machine` na zona `us-east-1a.`
2. Um volume EBS de **100GB** chamado de `this-volume.`
3. Será feito a redução para **30GB** utilizando o `novo-volume.`

``

### Tire um snapshot do volume

Na página de Volumes selecione o disco que deseja e tire um snapshot por precaução

### Crie o novo volume EBS com 30GB

1. Acesse a opção Elastic Block Store Volumes em EC2.
2. Clique em **Create Volume.**
3. Selecione o mesmo tipo de volume utilizado no volume antigo.
4. Determine o tamanho do novo volume, no nosso caso **30.**
5. Escolha a mesma availability zone para armazenar o `novo-volume` `us-east-1a`.
6. Adicione a Tag: Name com valor : novo-volume

### Conecte o novo volume no EC2

1. Botão direito no volume
2. Clique em "Attach Volume"
3. Selecione a instância `resize-machine`
4. Clique em "Attach"

Assim que acessarmos a máquina liste os discos para ver o novo volume disponível com o comando `lsblk`, no nosso caso o disco disponível é o `/dev/xvdf`
