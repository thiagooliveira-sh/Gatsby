---
image: /assets/img/bash.png
title: Sincronização com Rsync
description: O Comando Rsync Linux transfere e sincroniza arquivos ou diretórios
  de forma eficiente em uma máquina local ou entre hosts.
date: 2021-04-29
category: linux
background: "#EE0000"
tags:
  - Linux
categories:
  - Linux
---
Sincronizar pastas ou copiar arquivos manualmente pode consumir muito tempo. A utilidade do Rsync pode fazer a maior parte do trabalho adicionando recursos ótimos para economizar tempo. 

Qualquer um que trabalhe com sistema Linux deve conhecer e utilizar esse comando poderoso para melhorar sua produtividade. E com a ajuda deste artigo, você vai aprender tudo o que precisa saber para começar a usar. 

O rsync pode ser utilizado de forma local, no mesmo servidor, por exemplo executar uma rotina de backup salvando em um disco de backup, como também pode ser utilizado entre servidores remotos através do SSH. 

### Sintaxe básica

A utilização do rsync e bem simples, consiste na seguinte estrutura:

```
rsync [opcionais] [SRC] [DEST]
```

Neste exemplo, [opcionais] indicam as ações a serem tomadas, [SRC] é o diretório de origem e [DEST] é o diretório ou a máquina de destino.

Quando se fizer necessário a utilizaçao entre hosts, por SSH ou RSH, a sintaxe do rsync seguira da seguinte forma:

```
# Baixar de algum host para o ambiente local
rsync [opcionais] [USUÁRIO]@[HOST]:[SRC] [DEST]
# Enviar do ambiente local para host remoto
rsync [opcionais] [SRC] [USUÁRIO]@[HOST]:[DEST]
```

### Opcionais

Aqui está uma lista dos opcionais mais comuns e usados com o rsync:

Este habilita o modo de arquivo.
```
-a, --archive
```

Este dá a você uma saída visual que mostra o progresso do processo.
```
-v, --verbose
```

Já o próximo exibe o output num formato legível para humanos.
```
-h, --human-readable format
```

Esse aqui comprime os dados dos arquivos durante a transferência.
```
-z, --compress
```

Este copia os dados recursivamente

```
-r
```

Isto diz ao rsync para evitar cruzar os limites do sistema de arquivos quando for recorrente

```
-x, --one-file-system
```

Para finalizar, temos o que mostra o progresso de sincronização

```
--progress
```

### Exemplos

Temos alguns exemplos sobre a utilização do comando, observe algumas indicações de uso:

```
# Sincronizar um diretório de backup para um usuário
rsync -avx --progress /backup/user/Documentos/ /home/user/Documentos/

# Enviar um backup para um servidor externo
rynx -avx --progress /backup/app1/backup.tar.gz root@192.168.0.5:/usr/local/app1/
```

Bom, espero que tenham compreendido sobre como o rsync funciona e alguns cenários para sua aplicação, até a próxima!
