---
image: /assets/img/bash.png
title: 'Criar, Monitorar e Encerrar Processos'
description: >-
  Entender melhor os comandos antes de utiliza-los é muito importante, então
  segue alguns dos mais comuns quando falamos em gerenciamento de processos no
  linux..
date: '2020-08-05'
category: linux
background: '#EE0000'
tags:
  - Bash
  - Linux
---
Um processo é um serviço, comando, programa, script ou qualquer tipo de atividade que precise diretamente do sistema para ser executada. No linux podemos identificar processos através do seu PID (Process ID) ou PPID (Parent Process ID).

Existem algum comandos que podemos utilizar para identificar e gerenciar esses processos, um deles é o comando `PS`, um comando do unix utilizado para mostrar os processos em execução.

Exibição de processos ativos por usuário:

```bash
thiago@THIAGO-PC:~$ ps -u
USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
thiago   4464  0.0  0.1  23184  6048 pts/18   Ss   14:21   0:00 bash
thiago   6885  0.0  0.0  23076  5640 pts/22   Ss+  14:49   0:00 bash
thiago   7075  0.0  0.0  37404  3412 pts/18   R+   14:52   0:00 ps -u
```

Exibição de todos os processos do usuário inclusive os não pertencente a pts do cliente:

```
thiago@THIAGO-PC:~$ ps -ux | less
USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
thiago   1269  1.4  2.9 3168076 172888 ?      Sl   13:56   0:56 /snap/spotify/16/usr/share/spotify/spotify
thiago   4022  1.1  1.4 708912 82836 ?        Sl   14:17   0:31 /opt/google/chrome/chrome
thiago  31943  0.8  1.3 1284500 76856 ?       Ssl  13:34   0:45 /opt/sublime_text/sublime_text
```

Exibição de todos os serviços, de todos os usuários.

```
thiago@THIAGO-PC:~$ ps -ux | less
USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root         1  0.0  0.0 185264  5032 ?        Ss   07:59   0:02 /sbin/init splash
root         2  0.0  0.0      0     0 ?        S    07:59   0:00 [kthreadd]
root         4  0.0  0.0      0     0 ?        I<   07:59   0:00 [kworker/0:0H]
thiago  31943  0.8  1.3 1284500 76856 ?       Ssl  13:34   0:45 /opt/sublime_text/sublime_text
```

É possível filtrar a saída do comando ps utilizando grep, para obter processos referente a serviços específicos, como por exemplo `ps faux | grep sublime`, ou então podemos utilizar um outro comando, o `pgrep`.

O `pgrep` procura por todos os processos com determinado nome e retorna o seu ID, observe:

```
thiago@THIAGO-PC:~$ pgrep spotify
1269
1493
1515
1539
```

## Monitoramento de processos

Para o monitoramento de processos ativos temos disponíveis o comando `top` ou `htop` dessa forma teremos como obter informações como load, processos ativos, parados, uso de memoria, uso de cpu, usuário logados, uptime.

```
thiago@THIAGO-PC:~$ top
top - 17:09:44 up  9:10,  2 users,  load average: 0,66, 1,37, 1,53
Tarefas: 327 total,   2 executando, 271 dormindo,   0 parado,   2 zumbi
%Cpu(s):  5,1 us,  1,7 sy,  0,0 ni, 91,6 id,  1,7 wa,  0,0 hi,  0,0 si,  0,0 st
KiB Mem :  5898388 total,   380928 free,  3942560 used,  1574900 buff/cache
KiB Swap:  6083580 total,  5505788 free,   577792 used.   952804 avail Mem 

PID USUÁRIO  PR  NI    VIRT    RES    SHR S  %CPU %MEM     TIME+ COMMAND
27244 thiago   20   0 1275348  74016  29316 S   5,0  1,3  19:48.22 compiz                                                                       
27485 thiago   20   0 1394896 296652  89808 S   3,3  5,0  29:06.35 chrome
```

Dentro da interface top, temos alguns atalhos para filtrar melhor as informações que precisamos obter, observe:

```
Shift+m : Ordena exibição por uso de memória 
Shift+c : Ordena exibição por uso de CPU
u 	: Ordena exibição por usuário desejado
r 	: Alterar prioridade de exução do processo
n 	: Escolher quantas task são exibidas
k 	: Kill um processo de acordo com o PID
q 	: Quit
```

## Finalizar processos

Agora que sabemos identificar os processos ativos em nosso ambiente, é comum que em alguns casos tenhamos que parar um processo devido a consumo de recursos ou mal funcionamento do serviço/processo, para isso temos o comando `kill`, `killall`, `pkill`.

O comando kill é o mais utilizado, esse comando envia um sinal para o processo, seja para finalização, reinicialização, parar ou até interromper. O comando `kill -l` retorna os sinais que o comando kill pode enviar:

```
thiago@THIAGO-PC:~$ kill -l
1) SIGHUP	 2) SIGINT	 3) SIGQUIT	 4) SIGILL	 5) SIGTRAP
6) SIGABRT	 7) SIGBUS	 8) SIGFPE	 9) SIGKILL	10) SIGUSR1
11) SIGSEGV	12) SIGUSR2	13) SIGPIPE	14) SIGALRM	15) SIGTERM
```

Abaixo podemos observar o que cada sinal significa:

```
SIGHUP 1 Termina ou reinicia um processo. Utilizado também para
que arquivos de configuração de um programa sejam
relidos.
SIGINT 2 Interrompe a execução de um processo. Relacionado ao
Ctrl+C
SIGQUIT 3 Termina um processo e normalmente gera um arquivo de
dump
SIGKILL 9 Finaliza um processo de maneira imediata e incondicional.
SIGTERM 15 O sinal solicita que o processo se finalize. Sinal padrão do
comando kill.
SIGSTP 20 Interrompe um processo permitindo que ele possa ser
retomado. Relacionado ao Ctrl+Z
SIGCONT 18 Continua a execução de um processo pausado (pelo sinal
20 por exemplo)
```

Por padrão o sinal enviado é o SIGERM, para finalizar um processo repassamos o `PID` como parâmetro para o kill, dessa forma podemos utilizar os comandos vistos anteriormente para obter o ID do processo:

```
thiago@THIAGO-PC:~$ pgrep firefox
12259
thiago@THIAGO-PC:~$ kill 12259
thiago@THIAGO-PC:~$ pgrep firefox
thiago@THIAGO-PC:~$
```

Para finalizar com o SIGKILL podemos passar da seguinte forma:

```
thiago@THIAGO-PC:~$ kill -s SIGKILL 12596
ou
thiago@THIAGO-PC:~$ kill -s 9 12596
ou
thiago@THIAGO-PC:~$ kill -9 12596
```

O comando `killall` finaliza todos os processos, que o usuário seja dono, com o nome passado por parâmetro:

```
killall firefox
```

O comando `pkill` finaliza os processos de determinados usuários, geralmente utilizado pelo root para gerenciamento de processos de outros usuários.

```
root@THIAGO-PC:~# pkill -9 firefox -u thiago
```

Espero que tenham curtido o conteúdo de hoje, gerenciamento de processos é algo bem comum e bastante utilizado por nós administradores de sistemas, até a próxima pessoal!
