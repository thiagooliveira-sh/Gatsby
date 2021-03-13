---
image: /assets/img/bash.png
title: "Passos para um troubleshooing eficaz  "
description: Troubleshooting nada mais é do que seguir uma logica de análise
  para resolução de um problema especifico.
date: 2021-03-03
category: linux
background: "#EE0000"
tags:
  - Linux
  - Troubleshooting
categories:
  - Linux
---
Não precisamos nos desesperar e sair correndo atrás de ajuda sem nem entender o que se passa, antes de começar uma análise de  troubleshooting é interessante partirmos de alguns princípios básicos:

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

Com o comando `df` podemos ter uma visualização sobre o consumo geral de disco e partições, nada muito detalhado, apenas % de utilização.

###### du

Com o comando `du` começamos a ter mais informações, passamos a ter informações como tamanho de diretórios e arquivos.

###### ncdu

Assim como o `du` o `ncdu` informa a utilização de disco por diretório e arquivos, o seu diferencial é a disponibilização de uma interface que permite a navegação dentro dos diretórios e interação com os mesmos, podendo deletar arquivos por exemplo.

##### Overload e Memória

Para análise de utilização de cpu podemos utilizar o comando pidstat, top, htop e free.

###### pidstat

O pidstat é uma ferramenta de monitoramento, que torna possível acompanhar cada processo individualmente no Linux. já abordamos a sua utilização em uma [publicação](https://thiagoalexandria.com.br/analise-de-performance-com-pidstat/) dedicada inteiramente a ele.

###### top e htop

Esses comandos servem para analisar através de métricas a utilização de recursos por processo, por exemplo consumo de CPU, Ḿemória, IO direcionado por processo.

###### free

O comando free permite verificarmos quanto de memória encontra-se alocada pelo sistema e seus processos.

##### Comunicação
É comum que em determinados momentos precisemos analisar a comunicação do nosso servidor com serviços ou aplicações externos, para isso podemos contar com os comandos telnet e curl

###### telnet

Com o telnet conseguimos validar a comunicação com as portas no target, por exemplos, podemos verificar se existe resposta em alguma porta no ambiente de destino:

````
telnet 192.168.0.4 22
telnet 192.168.0.4 80
telnet 192.168.0.4 25
````

###### curl

Com o curl podemos verificar algumas chamadas web, enviar tanto `GET` como `POST` para os ambientes externos, para analisar se o nosso ambiente tem comunicação com os urls de destino, podemos apenas executar um `curl` e verificar o seu retorno:

````
curl -I https://thiagoalexandria.com.br

```` 


Bom pessoal, é isso. Espero que tenham curtido, pois entender um problema e saber como resolve-lo é algo que precisa estar enraizado na nossa rotina, precisamos conhecer bem como o nosso ambiente de comporta.

Até a próxima!