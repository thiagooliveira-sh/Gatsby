---
image: /assets/img/bash.png
title: "Passos para um troubleshooing eficaz  "
description: Troubleshooting nada mais é do que seguir uma logica de análise
  para resolução de um problema especifico.
date: 2021-03-13
category: linux
background: "#EE0000"
tags:
  - Linux
  - Troubleshooting
categories:
  - Linux
---
Não precisamos de desespero na hora que nos depararmos com um problema, a última coisa que queremos é sair correndo atrás de ajuda sem nem entender o que se passa, antes de começar uma análise de  troubleshooting é interessante partirmos de alguns princípios básicos:

* Entenda o problema e o serviço/aplicação
* Interprete e reproduza
* Leia os logs 

Seguindo esse fluxo, a compreensão e resolução dos problemas serão sempre muito simples.

### Conheça o serviço

Entenda como o serviço ou aplicação funciona, saiba onde ela armazena os seus logs, utilizaremos o serviço SSH durante os exemplos. 

O serviço SSH loga a maior parte das informações de acesso ou erro dentro do arquivo `/var/log/secure` dessa forma podemos filtrar os erros dependendo do horário da ocorrência. Ainda sobre análise do problema, é possível realizar um teste de conexão com a opção verbose do ssh-client ativa, para isso basta adicionar a diretiva `-v` com o comando ssh:

```
ssh -v -i chave.pub thiago.alexandria@192.168.0.3
```

Dessa forma podemos analisar todo o processo que ocorre durante uma conexão SSH, com isso conseguimos obter informações sobre todo o fluxo da sessão SSH. No momento que você entende realmente o problema, tudo fica mais fácil.

### Ferramentas para análise troubleshooting

### Systemctl

Com o systemctl podemos observar o status dos serviços, com isso podemos ligar, parar e reinicia-los

```
systemctl status sshd
systemctl restart sshd
```

### Journalctl

Ele coleta e armazena dados de registro mantendo diários indexados estruturados com base nas informações de registro recebidas do kernel. Por padrão o serviço do jornal é ativo, mas você pode validar essa informação checando o seu status utilizando o systemctl:

```
systemctl status systemd-journald
```

Por padrão, o diário armazena os dados de registro em `/run/log/journal/`. Como o diretório `/run/` é volátil, os dados de registro são perdidos na reinicialização. Para torná-los persistentes, deve haver um diretório `/var/log/journal/` com propriedade e permissões para o serviço journald armazenar os logs. O systemd criará o diretório para você (e mudará o registro para persistente), se você fizer o seguinte:

1. Como root, abra o `/etc/systemd/journald.conf`
2. Remova o comentário da linha com `Storage=` e mude-a para `Storage=persistent`
3. Grave o arquivo e reinicie o systemd-journald

Com o journalctl conseguimos obter informações sobre erros na grande maioria dos serviços, costumo utilizar bastante o comando da seguinte forma :

```
journalctl -xe | grep SERVICO
```

as opções `-xe` vão nos retornar algumas informações relevantes para tratarmos os problemas, o `-e` irá retornar as ultimas linhas do arquivo de journal, a opção `-x` adiciona textos de ajuda que podem explicar o contexto de um erro ou evento de log. Algumas vezes contem mais informações que o log do próprio serviço.

#### Comandos úteis

Temos alguns comandos que podem ser úteis durante a análise e identificação de problemas, vamos abordar alguns contextos e os comandos que podem ser utilizados para análise.

##### Problema com espaço em disco

Nesse cenário temos os comandos `df -h`, `du -h --max-depth=1.` e o `ncdu`. Ambos os comandos vão nos retornar informações referente a utilização de disco do servidor.

###### df

Com o comando `df` podemos ter uma visualização sobre o consumo geral de disco e partições, nada muito detalhado, apenas % de utilização. Um df -i mostra o numero de inodes livres tbm:

````
df -i
Filesystem      Inodes  IUsed   IFree IUse% Mounted on
overlay        3907584 415188 3492396   11% /
tmpfs           254908     17  254891    1% /dev
tmpfs           254908     15  254893    1% /sys/fs/cgroup
shm             254908      1  254907    1% /dev/shm
/dev/vda1      3907584 415188 3492396   11% /etc/hosts
tmpfs           254908      1  254907    1% /proc/acpi
tmpfs           254908      1  254907    1% /sys/firmware
````

###### du

Com o comando `du` começamos a ter mais informações, passamos a ter informações como tamanho de diretórios e arquivos.

###### ncdu

Assim como o `du` o `ncdu` informa a utilização de disco por diretório e arquivos, o seu diferencial é a disponibilização de uma interface que permite a navegação dentro dos diretórios e interação com os mesmos, podendo deletar arquivos por exemplo.

###### iotop 

O `iotop` é utilizado em cenários que precisamos saber qual processo esta com maior utilização dos discos do sistema.


##### Overload e Memória

Para análise de utilização de cpu podemos utilizar o comando pidstat, top, htop e free.

###### pidstat

O pidstat é uma ferramenta de monitoramento, que torna possível acompanhar cada processo individualmente no Linux. já abordamos a sua utilização em uma [publicação](https://thiagoalexandria.com.br/analise-de-performance-com-pidstat/) dedicada inteiramente a ele.

###### top e htop

Esses comandos servem para analisar através de métricas a utilização de recursos por processo, por exemplo consumo de CPU, Ḿemória, IO direcionado por processo.

###### free

O comando free permite verificarmos quanto de memória encontra-se alocada pelo sistema e seus processos.

###### dmesg

O comando mostra alguns logs uteis do sistema. Legal para procurar por erros de processos ou estouros de memória. Coisas importantes:

````
 dmesg | grep -i segfault
 dmesg | grep -i oom
 dmesg | grep -i Killed
 dmesg | grep -i error
````

Um exemplo de log de erro do dmesg:

````
[1880957.563150] perl invoked oom-killer: gfp_mask=0x280da, order=0, oom_score_adj=0
[...]
[1880957.563400] Out of memory: Kill process 18694 (perl) score 246 or sacrifice child
[1880957.563408] Killed process 18694 (perl) total-vm:1972392kB, anon-rss:1953348kB, file-rss:0kB
[2320864.954447] TCP: Possible SYN flooding on port 7001. Dropping request.  Check SNMP counters.
````

###### strace

Provavelmente a partir desse ponto você já deve saber o processo que mais esta causando problemas e agora precisamos investiga-lo melhor.

O strace mostra as chamadas para sistema que aquele processo esta fazendo e pode dar uma luz sobre o que mais pode estar dando problemas.

````
strace -p <PID>
ou
strace <comando>
````

O `strace -c` gera um sumario da utilização de um processo:

````
strace -c ls
test.cfg  nohup.out  original.cfg
% time     seconds  usecs/call     calls    errors syscall
------ ----------- ----------- --------- --------- ----------------
 16,57    0,000084           4        18           mprotect
 15,78    0,000080           2        28           mmap
  8,88    0,000045           4        11           open
  7,89    0,000040           4        10           read
  7,89    0,000040           2        14           close
  7,69    0,000039          13         3           munmap
  5,92    0,000030          15         2           getdents
  5,72    0,000029           2        12           fstat
  4,73    0,000024          12         2         2 statfs
  2,37    0,000012           6         2           ioctl
  2,17    0,000011          11         1           write
  2,17    0,000011           5         2         1 access
  1,97    0,000010          10         1         1 stat
  1,97    0,000010           3         3           brk
  1,78    0,000009           4         2           rt_sigaction
  1,78    0,000009           9         1           openat
  0,99    0,000005           5         1           getrlimit
  0,99    0,000005           5         1           arch_prctl
  0,99    0,000005           5         1           set_tid_address
  0,99    0,000005           5         1           set_robust_list
  0,79    0,000004           4         1           rt_sigprocmask
  0,00    0,000000           0         1           execve
------ ----------- ----------- --------- --------- ----------------
100.00    0,000507                   118         4 total
````

##### Comunicação

É comum que em determinados momentos precisemos analisar a comunicação do nosso servidor com serviços ou aplicações externos, para isso podemos contar com os comandos telnet e curl

###### telnet

Com o telnet conseguimos validar a comunicação com as portas no target, por exemplos, podemos verificar se existe resposta em alguma porta no ambiente de destino:

```
telnet 192.168.0.4 22
telnet 192.168.0.4 80
telnet 192.168.0.4 25
```

###### curl

Com o curl podemos verificar algumas chamadas web, enviar tanto `GET` como `POST` para os ambientes externos, para analisar se o nosso ambiente tem comunicação com os urls de destino, podemos apenas executar um `curl` e verificar o seu retorno:

```
curl -I https://thiagoalexandria.com.br
```

Bom pessoal, é isso. Existem diversos outros comandos que podem ser utilizados dependendo do cenário em que se encontra. Espero que tenham curtido, pois entender um problema e saber como analisa-lo é algo que precisa estar enraizado na nossa rotina, precisamos conhecer bem o nosso ambiente e como ele se comporta.

Até a próxima!