---
image: /assets/img/bash.png
title: Configuracao de Swappiness
description: A memória Swap do sistema operacional vai muito além de um refúgio
  do sistemas para momentos de sobrecarga da memória RAM.
date: 2020-12-28
category: linux
background: "#EE0000"
tags:
  - linux
---
Quando a RAM acaba, a memória Swap é utilizada para manter o sistema no ar. Porém, ela também é utilizada mesmo quando há RAM disponível. O próprio sistema move caches pouco utilizados da RAM para o Swap, alguns serviços podem também, descarregam seus caches na Swap. Ou seja, a Swap não somente é utilizada quando acaba a memória RAM.

Sabendo disso, existe uma configuração de swap que pode ser feita através do swappiness configurar a flexibilidade do sistema no uso de Swap. Em maioria a sua configuração padrão é de 60, abaixo vou deixar uma imagem sobre os valores:

![swapiness](/assets/img/swap.png)

> O valor “1” é o mínimo que podemos atribuir ao Swappiness, pois o valor “0” indica que o sistema não poderá usar Swap.

Para verificar e alterar as configurações de swappiness basta seguir os passos:

1 - Primeiramente, vejamos o valor atual do swappiness.

```
sysctl -a | grep -i swappiness
```

2 - A saída do comando será similar a esta:

```
vm.swappiness = 60
```

3 - Para mudar a sua configuração, basta editar o arquivo `/etc/sysctl.conf` e adicionar a variável com o valor que deseja:

```
vm.swappiness=10
```

4 - Ajustado a variável execute o coamndo abaixo para a configuração ser aplicada:

```
sysctl -p /etc/sysctl.conf
```

> Talvez seja necessário limpar a swap com os comandos `swapoff -av` e dps liga-la novamente `swapon -av`