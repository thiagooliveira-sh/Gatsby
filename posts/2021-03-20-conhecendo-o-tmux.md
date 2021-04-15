---
image: /assets/img/bash.png
title: Conhecendo o Tmux
description: "tmux é um multiplexador de terminal de código aberto para sistemas
  operacionais do tipo Unix. "
date: 2021-03-20
category: linux
background: "#EE0000"
tags:
  - Bash
  - Linux
categories:
  - Linux
---
Tmux é uma aplicação que é baseada em sessões. Isto é, quando você executa uma utilidade ele abre uma nova sessão. Em cada sessão pode haver vários terminais, porque o Tmux é um multiplexador de terminais.

Para começar a usar o Tmux, vamos inicialmente intala-lo, para realizar esse processo de instalação é bem simples basta que siga com o processo de instalação referente ao seu gerenciador de pacote:

```
sudo apt-get install tmux

sudo yum install tmux

brew install tmux
```

Com o programa instalado, execute o comando ˜tmux -V˜ para verificar se ele foi devidamente instalado e qual a sua versão.

## **Primeiros Passos com Tmux**

Para abrir uma nova sessão basta utilizarmos o comando:

```
tmux new
```

Uma vez que iniciamos a sessão, veremos o mesmo terminal como sempre, exceto uma barra verde no fundo, observe:

![](/assets/img/tmux1.png)

Esta barra indica a sessão ativa e que estamos usando o Tmux. Assim como com uma screen, podemos nomear as sessões para facilitar a sua identificação. Para fazer isto, utilizamos o seguinte comando:

```
tmux new -s [nome]
```

Para finalizar uma sessão, precisamos digitar o seguinte comando:

```
exit
```

A utilidade mais importante do Tmux é que permite diferentes instâncias de terminais em uma única janela, permitindo acessá-las de forma rápida e fácil pelo teclado.

![](/assets/img/tmux2.png)

### **Controlando o Tmux**

Para trabalhar com Tmux precisamos ter em mente que para execução de seus comandos precisamos antes entender os seus prefixos, por padrão o prefixo é o CTRL+B. Então o caminho certo para estruturar um comando Tmux é: 

```
<prefixo> + Comando.
```

Ou seja, temos que pressionar as teclas `CTRL + B` e depois o comando. Por exemplo, para criar uma nova sessão, o comando seria `C`. Portanto, para criar uma nova sessão, precisamos pressionar `CTRL + B` e depois `C`.

### Alguns Comandos Para Ajudar

Existe algumas dicas úteis para quando estamos trabalhando com o Tmux, a principal é para quando precisamos fazer o `detach` da sessão. Então, primeiro apertamos `CTRL+B` e em seguida o `D`. Vamos ver que teremos a próxima mensagem no terminal:

```
[detached (from session nome_da_sessao)]
```

Agora precisamos voltar para nossa sessão `attach`. Para fazer isto, utilizamos o seguinte comando:

```
tmux attach -t [nome_da_sessao]
```

Se você já tiver várias sessões podemos listar as ativas no tmux com o seguinte comando:

```
tmux ls 
```

Teremos um retorno semelhante ao da imagem abaixo:



É possível fazer várias sessões com o comando `C`. Para navegar entre elas então vamos usar o número identificador. Por exemplo, a primeira sessão que criamos do terminal regular seria `0`. Se nós criarmos outra sessão ela corresponderá ao número `1`.

```
CTRL+B, 1
```

Nós podemos ver a sessão atual na barra verde na parte inferior da janela.

### Gerenciando Painéis e telas

Com o Tmux temos a liberdades de dividir a tela do shell, chamado de paineis, tanto horizontalmente como verticalmente. Aumentando os paineis permitindo trabalhar em várias situações ao mesmo tempo, vamos ver então alguns dos principais comandos para trabalhar de forma otimizada com paineis:

#### Janela

* Nova Janela:	`<prefix>+c`
* Próxima Janela:	`<prefix>+n`
* Listar todas as janelas:	`<prefix>+w`
* Renomear uma janela:	`<prefix>+,`

#### Painéis

* Dividir painel na vertical:	`<prefix>+%`
* Dividir painel na horizontal:	`<prefix>+“`
* Eliminar o painel:	`<prefix>+x`
* Mostrar número do painel:	`<prefix>+q`
* Alternar entre painéis:	`<prefix>+Setas do teclado

Bom, espero que tenham curtido e compreendido `