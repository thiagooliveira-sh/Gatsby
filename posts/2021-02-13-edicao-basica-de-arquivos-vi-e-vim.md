---
image: /assets/img/bash.png
title: Edicao basica de arquivos vi e vim
description: vi é um editor de textos, padrão nos sistemas Unix, criado na
  década de 70. Vim é uma versao melhorada do vi
date: 2021-02-13
category: linux
background: "#EE0000"
tags:
  - Linux
categories:
  - Linux
---
Estranhamos bastante o fato de usarmos o terminal como editor de textos. Parece inútil e lento para editar textos, uma vez que não podemos usar o mouse. 

É aí que a gente se engana. Não percebemos, mas, para editar texto, o mouse mais atrapalha que ajuda, pois temos que constantemente tirar as mãos do teclado e leva-las até o mouse e vice-versa.

Sabendo que o vi é um editor de texto, vamos aprender os principais comandos, e alguns atalhos que são bastante úteis no dia a dia.

### Edição básica

Para editar um arquivo utilizando o vim, basta utilizar o comando da seguinte forma `vim /path/arquivo.txt`, dessa forma você será direcionado para uma tema semelhante a essa:

![](/assets/img/captura-de-tela-de-2021-02-20-22-16-08.png)

Existem algumas formas de começarmos a editar um arquivo com o `vim`:

* `i` Inicia o modo de inserção
* `a` Inicia o modo de inserção com um append para o próximo caractere
* `A` Inicia o modo de inserção com um append no fim da linha
* `o` Inicia o modo de inserção com uma nova linha
* `u` Recupera a última alteração
* `U` Recupera a linha até antes de todas as edições serem feitas nela

Assim como podemos editar, temos alguns comandos para deletar:

* `dd` Deleta toda a linha
* `dnd` Deleta uma quantidade de linhas, onde `n` é o numero de linhas que deseja remover
* `D` Remove o conteúdo de uma linha

Feito a a edição do arquivo, temos que salvar e se nesessário sair do arquivo, para isso temos os seguintes comandos, lembre-se que precisamos apertar a tecla `esc`  para sair do modo de edição e `:` para inserirmos alguns comandos:

* `w` Salva o arquivo porém não saimos do arquivo 
* `wq` Salvar e sair do arquivo
* `ZZ` Outra forma de sair e salvar o arquivo
* `q!` Utilizado para sair sem salvar, igorando as edições

### Navegação

Por se tratar de um editor de texto utilizado em terminais, temos alguns comandos para facilitar a nossa navegação dentro do arquivo, assim como para realizar buscas:

* `gg` Vai para o inicio do arquivo
* `G`  Vai para o final do arquivo
* `23G` vai para a 23ª linha
* `Ctrl+f | Ctrl+b` Page up e Page Down
* `Ctrl+e | Ctrl+y` Scroll up e Scroll down
* `/` Realizar pesquisas
* `e` Coloca o cursor no fim da palavra
* `w` Coloca o cursor na próxima palavra
* `b` Coloca o cursos na palavra anterior

### Copiar e colar

Assim como nos editores normais, temos a funcionalidade de copiar e colar, porém não é feito com ctrl+c e v, para isso é utilizado o comando `y`de yanke e `p`de put

* `y$` Copia tudo ate o fim da linha
* `2yy` Copia o atual e as duas seguintes linhas
* `p` Cola o conteudo copiado

O vim tem alguns outros comandos que podem ser imcoporados, como a utilização de regex, repetições e replaces, dessa forma vou deixar uma imagem logo abaixo que é uma tabela periodica, contendo várias informações sobre os comandos e sua finalidade:

![](/assets/img/vi-teclado.png)



Bom, espero que tenham curtido, pretendo trazer mais conteúdo focados em serviços e sobre o meu dia a dia como devops dessa forma o vim encontra-se presente em todas as nossas tarefas falando em manuseio e edição de arquivos.

Até a próxima!