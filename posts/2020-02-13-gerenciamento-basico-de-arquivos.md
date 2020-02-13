---
image: /assets/img/bash.png
title: Gerenciamento básico de arquivos
description: >-
  Entender melhor os comandos antes de utiliza-los é muito importante, então
  segue alguns dos mais comuns.
date: '2020-02-13'
category: linux
background: '#EE0000'
tags:
  - Bash
categories:
  - Linux
---
É muito comum vermos os tutoriais sobre linux informando diversas variantes de comandos como ***ls, mkdir, cp, mv*** e não informar para que as serve. Irei compartilhar alguns dos comandos que mais utilizo dentro do meu dia a dia como analista de sistemas, assim como qual a sua utilidade e suas principais variantes.

Vou dividir essa serie de postagens em **"Gerenciamento básico de arquivos", "Fluxos, Pipes e Redirecionamentos" e "Criar, Monitorar e Encerrar Processos"**, iniciaremos abordando o Gerenciamento básico de arquivos, através dos comandos ***cd, ls, file, touch, cp, mv, rm, mkdir, rmdir, find***.

Antes de começarmos, vou repassar alguns atalhos para facilitar a nossa utilização do terminal, o mais comum é o "TAB" para realizar o autocomplete, porém existem outros que podemos utilizar para aumentar a nossa agilidade durante os procedimentos, são eles:

```bash
Ctrl+c: Cancela o comando executado
Ctrl+d: Desloga da sessão atual (exit)
Ctrl+u: Apaga a linha inteira
Ctrl+a: Vai para o inicio da linha (Home)
Ctrl+l: Limpa a tela
Seta ^: Mostra os ultimos comandos digitados
```



Existem outros, porém esses são os que julgo mais importantes e que utilizo com mais frequência.



## Comandos Básicos

Quando começamos a utilizar o terminal, principalmente no linux, é normal não sabermos como navegar pelo filesystem do sistema operacional, em que pasta estamos, como listar o conteúdo da pasta, então segue alguns comandos para facilitar esse processo de aprendizagem:

```bash
cd - Entrar no diretório desejado
#Acessar diretório:
thiago@pc:~$ cd Downloads/
thiago@pc:~/Downloads$ 

#Votlar um nível no diretório:
thiago@pc:~/Downloads$ cd ..
thiago@pc:~$ 

#Volta para o diretório anterior:
thiago@pc:~$ cd -
/home/thiago/Downloads
thiago@pc:~/Downloads$

#Voltando 2 níveis no sistema de arquivo:
thiago@pc:~/Downloads$ cd ../..
thiago@pc:/home$
```

Para listagem de arquivos e diretórios temos o comando ***ls*** e algumas variações que nos trazem mais informações sobre o conteúdo listado:

```bash
#Listagem de arquivos e diretórios
thiago@pc:~$ ls
Área de Trabalho  Downloads     Desktop         Vídeos

#Listagem de arquivos e arquivos ocultas:
thiago@pc:~$ ls -a
.                   Área de Trabalho   Downloads
..                  .gconf             .purple

#Listagem detalhada de arquivos e diretório:
thiago@pc:~$ ls -l #Pode ser usada também ls -la para add listagem ocultas
total 85900
drwxr-xr-x 2 thiago thiago     4096 Mai 23 13:10 Área de Trabalho
drwxr-xr-x 2 thiago thiago     4096 Mai 10 15:01 Desktop

#Listagem detalhada para visualização de tamanho de pastas:
thiago@pc:~$ ls -lh
total 84M
drwxr-xr-x 2 thiago thiago 4,0K Mai 23 13:10 Área de Trabalho
drwxr-xr-x 2 thiago thiago 4,0K Mai 10 15:01 Desktop

```

Podemos também verificar que tipo de arquivo é exibido, por exemplo de uma image, conseguimos verificar se de  fato o arquivo .png é uma imagem, para isso, utilizamos o comando ***file***

```bash
thiago@pc:~/Downloads$ file email.png
email.png: PNG image data, 1074 x 824, 8-bit/color RGB, non-interlaced
```



## Manipulação de arquivos

É bastante comum termos de criar, mover, copiar arquivos no nosso dia a dia, através do terminal isso também é comum e possuímos alguns comandos para realizar essa manipulação de arquivos, para copiar utilizando o comando ***cp:***

```bash
# Copiar um arquivo para um determinado local:
thiago@pc:~/Downloads$ cp codigo-aluno.txt  /home/thiago/Documentos/
thiago@pc:~/Downloads$ ls -l /home/thiago/Documentos/
-rw-rw-r-- 1 thiago thiago 38 Jun  9 14:41 codigo-aluno.txt

# Copiando diretórios com o comando cp de forma recursiva:
thiago@pc:~/Downloads$ cp -rv  Copia/ /tmp/
'Copia/' -> '/tmp/Copia'
'Copia/texto.txt' -> '/tmp/Copia/texto.txt'

# Copias com preservação de permissão:
thiago@pc:~/Downloads$ cp -p texto.txt /tmp/

# Copiar um arquivo para outro arquivo de nome diferente:
thiago@pc:~/Downloads$ cp texto.txt novotexto.txt
```

Para a realização da criação de arquivos, você pode utilizar diversos comandos, como por exemplo, através de um editor de texto como ***nano*** e ***vim***, porém nesse caso será utilizado o comando ***touch*** pois é bastante simples:

```bash
# Criar um arquivo em brando utilizando o touch
thiago@pc:~$ touch linux.txt
```

Assim como a necessidade de criação dos arquivos, precisamos muitas vezes realizar a remoção de alguns desses, seja para liberação de espaço como também para remoção de arquivos indesejados, para isso é utilizado o comando ***rm*** porém, bastante cuidado para não remover conteúdo critico do sistema:

```bash
# rm Caminho/Completo/do/Arquivo.txt remove sem que seja perguntado nada
thiago@pc:/tmp/teste$ rm teste2/arq5.txt 

# Remoção com solicitação de permissão 
thiago@pc:/tmp/teste$ rm -i teste2/arq2.txt 
rm: remover arquivo comum vazio 'teste2/arq2.txt'? y
thiago@pc:/tmp/teste$ 

# rm -v nome_do_arquivo (verbose, mostra todas as interações)
thiago@pc:/tmp/teste$ rm -v teste2/arq*
removido 'teste2/arq1.txt'
removido 'teste2/arq2.txt'

# rm -r Diretorio/ (remoção de tudo que existe na pasta diretorio inclusive a pasta)
thiago@pc:/tmp/teste$ rm -r -v teste3/
removido 'teste3/arq1.txt'
removido 'teste3/arq2.txt'
removed directory 'teste3/'
```

Para a criação e manipulação de diretórios, temos os comandos ***mkdir*** e ***rmdir:***

```bash
# Criação de diretório
thiago@pc:/tmp/teste$ mkdir -v teste5
mkdir: foi criado o diretório 'teste5'

# Criando arvoré de diretório
thiago@pc:/tmp/teste$ mkdir -v -p teste10/teste9
mkdir: foi criado o diretório 'teste10'
mkdir: foi criado o diretório 'teste10/teste9'

# Removendo arvore de diretórios vazias
thiago@pc:/tmp/teste$ rmdir -v -p teste10/teste
rmdir: removendo o diretório 'teste10/teste9'
rmdir: removendo o diretório 'teste10'
```

## Busca e compactação

A busca de arquivos é algo bastante util, quando precisamos achar todos os arquivos de configurações de um serviço, todos os arquivos de backup, e para ele, utilizamos o comando ***find*** que pode ser utilizado em conjunto com alguns outros comandos como ***exec*** e ***xargs***, porém nesse exemplo o nosso intuito é apenas identificar os arquivos que foram achados:

```bash
# Achar todos os arquivos .conf
thiago@pc:~$ find Downloads/ -name "*.conf"
Downloads/Teste/httpd.conf
Downloads/Teste/exim.conf


```

Já na compactação de conteúdo, temos várias ferramentas que podem ser utilizadas, como ***tar, gzip, bzip2, xz*** porém utilizaremos o tar com gzip para agrupar e compactar os arquivos:

```bash
# Agrupamento e extração de arquivos utilizando Tar:
c create
x extract 
t list
f determina nome do .tar
p preserva permissões originais
v verbose para visualizar atualização 
```

Sabendo os parâmetros do comando, vamos seguir agrupando alguns arquivos 

```bash
# Criando arquivo agrupado 
thiago@pc:~/Downloads/Teste$ tar cpvf exemplo.tar *.conf
httpd.conf
exim.conf
```

Após agrupado, podemos compactar, utilizando o ***gzip***, basta indicar o arquivo:

```bash
thiago@pc:~/Downloads/Teste$ gzip exemplo.tar
```

Podemos fazer o processo de compactação diretamente pelo comando ***tar***, basta adicionar o parâmetro ***z*** para compactar e ***x*** para extrair:

```bash
# Compactar
thiago@pc:~/Downloads/Teste$ tar zcvf exemplo.tar.gz *.conf
httpd.conf
exim.conf

# Descompactar
thiago@pc:~/Downloads/Teste$ tar zxvf exemplo.tar.gz
./httpd.conf
./exim.conf
```



Espero que tenham gostado do conteúdo abordado, nas próximas postagens, vamos abordar **"Fluxos, Pipes e Redirecionamentos".**
