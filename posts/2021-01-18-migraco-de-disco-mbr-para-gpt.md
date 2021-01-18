---
image: /assets/img/AWS.png
title: Migração de disco MBR para GPT
description: GPT é um tipo de tabela de partição para grandes unidades que
  excedem o limite de tamanho de 2 TB de MBR.
date: 2021-01-18
category: aws
background: "#FF9900"
tags:
  - AWS
  - LINUX
---
# Cenário

Máquinas que atingiram o limite de disco de 2TB e precisam ter o sistema operacional migrado para um disco GPT com maior capacidade. 

## Processo

GPT é um tipo de tabela de partição para grandes unidades que excedem o limite de tamanho de 2 TB de MBR. O particionamento de disco e a criação de sistema de arquivos para unidades GPT usando ferramentas de disco não são diferentes do MBR. No entanto, para instalar o GRUB nele, precisamos criar uma partição de inicialização do BIOS especificamente para o GRUB.

Para clonar o disco precisamos seguir os seguintes passos, antes de iniciar crie o disco novo e conect com a máquina que o receberá.

#### Criar tabela de partição GPT

Antes de criar a tabela de partição, você deve usar `wipefs` para limpar as assinaturas e evitar avisos. Todos os comandos aqui são executados como usuário `root`

```
wipefs -a /dev/sdb
parted /dev/sdb mklabel gpt
```
![](/assets/img/gpt1.png)

A tabela da partição já encontra-se como `gpt`. A unidade /dev/sdb tem 976773164 setores, ou seja, 976773164/2048 = 476940 MiB.

### Crie a partição de inicialização do BIOS

O tamanho razoável para esta partição é 1 MB, ou seja, 2.048 setores por padrão (pode ser mais)

```
parted /dev/sdb mkpart primary 1 2
```

![](/assets/img/gpt2.png)

#### Crie uma partição raiz

Usamos todo o espaço em disco restante para criar uma partição como a partição raiz para tentar instalar o GRUB mais tarde. Ou seja, do setor 4096 ao final da unidade, ou seja, do MiB 2 ao MiB 476940

```
parted /dev/sdb unit MiB mkpart primary 2 476940
```

#### Defina o tipo de partição para a partição de inicialização do BIOS

Esta partição precisa ter o tipo adequado para que o GRUB possa encontrá-la automaticamente e, em seguida, gravar a imagem nela

```
parted /dev/sdb set 1 bios_grub on
```

![](/assets/img/gpt3.png)

#### Crie um sistema de arquivos para a partição raiz

Crie o sistema de arquivos:

> Crie com o file system que preferir.

```
mkfs.ext4 /dev/sdb2
```

#### Faça a migração do conteúdo entre os discos

Para clona-los, precisaremos montar o disco na máquina e realizar a sincronização do conteúdo:

```
mkdir -p /mnt/new
mount /dev/sdb2 /mnt/new
screen
rsync -axv --progress / /mnt/new
```

#### Instale o GRUB

Finalizado a cópia do conteúdo, instalamos o GRUB em /dev/sdb para garantir que as etapas acima estejam corretas, o GRUB encontra a partição de inicialização do BIOS e a instalação é bem-sucedida

```
grub2-install /dev/sdb --boot-directory=/mnt/new/boot
```

#### Ajustar UUID

Copiado todo o conteúdo e ajustado e disco, basta desmontar o disco e coliar o UUID para o mesmo do original, dessa forma não é necessário ajustes no fstab.

* Verifique as UUID dos discos para que possamos cloná-las `blkid`.
* Com as UUID copiadas, vamos substitui-las com o comando `tune2fs -U "UUID" /dev/sdb2`.
* Feito isso podemos sair e desligar a máquina e trocar os discos.

> Antes de iniciar a máquina, lembre-se que o disco precisa ser montado no mesmo caminho que o antigo, isso ocorrer na aws. Geralmente o ponto de montagem é /dev/sda1