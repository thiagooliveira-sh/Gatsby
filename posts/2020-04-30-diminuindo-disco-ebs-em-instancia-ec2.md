---
image: /assets/img/AWS.png
title: Diminuindo disco EBS em instancia EC2
description: '  Talvez você esteja se perguntando, podemos diminuir o tamanho do volume do   EBS? A resposta é não. É impossível diminuir o tamanho do volume do EBS.   Quando você tem 100GB de EBS e decide modificá-lo para 30GB, você receberá um   erro. Mas não precisa se preocupar, existe uma forma de contornarmos e   aplicar reduções utilizando um disco menor.'
date: '2020-04-30'
category: aws
background: '#FF9900'
tags:
  - AWS
  - EBS
  - EC2
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
8. Substituir o novo volume na instância.

### Antes de iniciar

Supomos que o ambiente que sofrerá a intervenção esteja disposta da seguinte forma

1. Uma instância chamada `resize-machine` na zona `us-east-1a.`
2. Um volume EBS de **100GB** chamado de `old-volume.`
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

Assim que acessarmos a máquina liste os discos para ver o novo volume disponível com o comando `lsblk`, no nosso caso o disco disponível é o `/dev/xvdf`.

### Formatar o novo volume

1. Cheque se o volume de fato não possui nenhum arquivo utilizando o comando`file -s /dev/xvdf`.
2. Se o retorno for `/dev/xvdf: data`, significa que o volume esta vazio e pronto para formatação.
3. Formate o disco utilizando o comando`mkfs -t ext4 /dev/xvdf`.

### Montar o novo volume

1. Crie um diretório para poder montarmos o volume `mkdir /mnt/resize`.
2. Monte o novo volume no diretório que criamos `mount /dev/resize`.
3. Cheque com o comando `df -h` se o disco foi montado sem problemas.

### Copiar os dados do volume antigo para o novo.

1. Nesse passo utilizaremos o `rsync` para copiar todo o disco antigo para o novo volume, para evitar problemas com timeout, indicamos a execução do comando dentro de uma screen.
2. Para criar uma nova screen basta acessar o servidor e digitar o comando `screen`.
3. Na nova screen basta executar o seguinte comando `rsync -axv --progress / /mnt/resize`.

Você pode sair da screen e voltar depois caso seja muito dado, para isso segue alguns comandos básicos para screen:

![screen](/assets/img/screen.png "screen")

### Preparar o novo volume

1. será necessário instalar o `grub` no novo disco, para isso execute o comando `grub2-install --root-directory=/mnt/resize/ --force /dev/xvdf.`
2. Desmonte o `novo-volume` com o comando `umount /mnt/new-volume`.
3. Verifique as UUID dos discos para que possamos cloná-las `blkid`.
4. Com as UUID copiadas, vamos substitui-las com o comando `tune2fs -U UUID /dev/xvdf`.
5. Feito isso podemos sair e desligar a máquina e trocar os discos. 

### Substituir o novo volume na instância

1. Pare a instância `resize-machine`.
2. Remova o disco `old-volume` e `new-volume`.
3. Conecte o `new-volume` no ponto de montagem que estava o antigo no nosso caso será o `/dev/sda1`.
4. Inicie a instância  `resize-machine`.

Pronto, feito a troca do disco, basta iniciar a máquina novamente e validar todas as partições e serviços que operam no servidor. No próximo post vou abordar uma segunda forma para realizarmos esse procedimento, indicado para ambientes mais complexos e particionados.
