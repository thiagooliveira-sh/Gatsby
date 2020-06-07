---
image: /assets/img/bash.png
title: Análise de performance com PIDSTAT
description: >-
  O pidstat é uma ferramenta de monitoramento, que torna possível acompanhar
  cada processo individualmente no Linux.
date: '2020-06-07'
category: linux
background: '#EE0000'
tags:
  - Bash
categories:
  - Linux
---
Pidstat quer dizer PID Statistics, a ferramenta fornece várias informações, o que inclui o uso da CPU, memória e até o uso do disco e estatísticas de uso das threads associadas as tarefas executadas por cada processo.

Para poder executar este comando, você precisa instalar o pacote de ferramentas sysstat. Segue abaixo o processo de instalação:

```bash
#CentOS/Fedora
yum install sysstat

#Ubuntu/Debian
sudo apt-get install sysstat
```

Para obter as estatísticas referentes a todos os processos use a opção`-p ALL`(note as maiúsculas), tal como você pode observar no exemplo abaixo:

```bash
thiago@DESKTOP-PUAQN5J:~$  pidstat -p ALL
Linux 3.13.0-39-generic (case-530U3C-530U4C-532U3C)     25-11-2014  _x86_64_    (4 CPU)
 
16:06:47      UID       PID    %usr %system  %guest    %CPU   CPU  Command
16:06:47        0         1    0,00    0,00    0,00    0,01     3  init
16:06:47        0         2    0,00    0,00    0,00    0,00     0  kthreadd
16:06:47        0         3    0,00    0,00    0,00    0,00     0  ksoftirqd/0
16:06:47        0         5    0,00    0,00    0,00    0,00     0  kworker/0:0H
16:06:47        0         7    0,00    0,03    0,00    0,03     3  rcu_sched
...
16:06:47        0     29597    0,00    0,00    0,00    0,00     3  kworker/3:1H
16:06:47        0     29599    0,00    0,00    0,00    0,00     3  irq/43-mei_me
16:06:47        0     31144    0,00    0,00    0,00    0,00     2  kworker/u16:1
16:06:47        0     31290    0,00    0,00    0,00    0,00     2  kworker/u17:1
16:06:47        0     31448    0,00    0,00    0,00    0,00     2  kworker/2:0
```

Acima, você pode observar as informações de uso da CPU para todos os processos em execução.\
Se quiser, pode ver os valores referentes a um processo (PID) em particular:

```bash
thiago@DESKTOP-PUAQN5J:~$  pidstat -p 29597

Linux 3.13.0-39-generic (case-530U3C-530U4C-532U3C)     25-11-2014  _x86_64_    (4 CPU)
 
16:19:48      UID       PID    %usr %system  %guest    %CPU   CPU  Command
16:19:48        0     29597    0,00    0,00    0,00    0,00     3  kworker/3:1H
```

## Como listar estatísticas de performance baseado no nome do processo

Para resolver este problema, use a opção do comando`-C`. Para exibir as informações pros processos que cujos nomes contenham a palavra Apache ficará da seguinte forma:

```bash
thiago@DESKTOP-PUAQN5J:~$  pidstat -C apache
Linux 3.13.0-39-generic (case-530U3C-530U4C-532U3C)     25-11-2014  _x86_64_    (4 CPU)
 
17:10:42      UID       PID    %usr %system  %guest    %CPU   CPU  Command
17:10:42        0      1342    0,00    0,00    0,00    0,00    2   apache2
```

Para repetir um comando, dentro de um intervalo, acrescente um número correspondente às vezes em segundos.\
Vamos configurar a sua saída para 5 segundos acrescentando o valor 5, ele passará a repetir o comando a cada 5 segundo:

```bash
thiago@DESKTOP-PUAQN5J:~$  pidstat -C apache 5
17:10:44      UID       PID    %usr %system  %guest    %CPU   CPU  Command
17:10:44        0      1342    0,00    0,00    0,00    0,00    2   apache2

17:10:49      UID       PID    %usr %system  %guest    %CPU   CPU  Command
17:10:49        0      1342    0,00    1,00    0,00    1,00     2  apache2
```

## Como exibir estatísticas de Entrada/Saída de processos

Para exibir o relatório estatístico de Entrada/Saída de um determinado processo, a cada 1 segundo, use a opção `-d`, da seguinte forma:

```bash
thiago@DESKTOP-PUAQN5J:~$  pidstat -p 10993 -d 1
Linux 3.13.0-39-generic (case-530U3C-530U4C-532U3C)     25-11-2014  _x86_64_(4 CPU)
 
19:41:19      UID       PID   kB_rd/s   kB_wr/s kB_ccwr/s  Command
19:41:20     1000     10993      0,00     96,00      0,00  firefox
19:41:21     1000     10993      0,00      0,00      0,00  firefox
19:41:22     1000     10993      0,00    128,00      0,00  firefox
19:41:23     1000     10993      0,00    256,00      0,00  firefox
19:41:24     1000     10993      0,00    160,00      0,00  firefox
19:41:25     1000     10993      0,00    160,00      0,00  firefox
19:41:26     1000     10993      0,00    160,00      0,00  firefox
19:41:27     1000     10993      0,00    128,00      0,00  firefox
^C
Média:      1000     10993      0,00    136,00      0,00  firefox
```

Acima é possível verificar as taxas de leitura e gravação no disco em Kb/s.

## Como mostrar utilização de memória por processos específicos

Aqui, entra em uso a opção -r, conforme o exemplo abaixo, para exibir utilização da memória, referentes a uma determinada tarefa (PID):

```bash
thiago@DESKTOP-PUAQN5J:~$  pidstat -p 10993 -r 1
Linux 3.13.0-39-generic (case-530U3C-530U4C-532U3C)     25-11-2014  _x86_64_(4 CPU)
 
19:58:46      UID       PID  minflt/s  majflt/s     VSZ    RSS   %MEM  Command
19:58:47     1000     10993     22,00      0,00 1602560 432344  11,55  firefox
19:58:48     1000     10993     36,00      0,00 1602560 432592  11,56  firefox
19:58:49     1000     10993     27,00      0,00 1594364 432728  11,56  firefox
19:58:50     1000     10993     20,00      0,00 1594364 432992  11,57  firefox
19:58:51     1000     10993     27,00      0,00 1594364 432992  11,57  firefox
^C
Média:      1000     10993     26,40      0,00 1597642 432730  11,56  firefox
```

## Como exibir comandos em execução e seus argumentos

Com a utilização do `-d` teremos acesso a informação completa do comando em execução pelo processo em questão, observe:

```bash
thiago@DESKTOP-PUAQN5J:~$  pidstat -C chrome -l
 
Linux 3.13.0-40-generic (case-530U3C-530U4C-532U3C)     26-11-2014  _x86_64_    (4 CPU)
 
15:28:17      UID       PID    %usr %system  %guest    %CPU   CPU  Command
15:28:17     1000     10651    0,02    0,01    0,00    0,03     2  /opt/google/chrome/chrome --incognito 
15:28:17     1000     10662    0,00    0,00    0,00    0,00     0  /opt/google/chrome/chrome --type=zygote --enable-crash-reporter=BFA8A187-CB5C-B8FF-FDD3-F84DA1B302F1 
15:28:17     1000     10691    0,00    0,00    0,00    0,00     2  /opt/google/chrome/chrome --type=gpu-process --channel=10651.0.2015679771 --enable-crash-reporter=BFA8A187-CB5C-B8FF-FDD3-F84DA
15:28:17     1000     10710    0,00    0,00    0,00    0,00     1  /opt/google/chrome/chrome --type=renderer --disable-databases --enable-deferred-image-decoding --lang=pt-BR --force-fieldtrials
15:28:17     1000     10717    0,00    0,00    0,00    0,00     3  /opt/google/chrome/chrome --type=renderer --enable-deferred-image-decoding --lang=pt-BR --force-fieldtrials=AutoReloadExperimen
```

O pacote Sysstat possui outras funcionalidades, como o comando `sar`. Ele é usado para coletar, relatar e salvar CPU, memória e uso de E / S no Unix, como o sistema operacional. O comando `sar` produz os relatórios rapidamente e também pode salvar os relatórios nos arquivos de log. 

Por hoje é só, em breve traremos um novo artigo sobre o `sar` e como utilizá-lo para ter acesso a esses relatórios.
