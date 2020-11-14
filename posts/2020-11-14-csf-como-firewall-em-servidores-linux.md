---
image: /assets/img/bash.png
title: CSF como firewall em servidores linux
description: >-
  O CSF é um um firewall SPI (Stateful Packet Inspection), login/detecção de
  intrusão e aplicativo de segurança para servidores Linux.
date: '2020-11-13'
category: linux
background: '#EE0000'
tags:
  - Linux
  - firewall
---
O CSF é um firewall que possui diversas configurações para proteção de intrusão e ataques como Portflood e Synflood, Bruteforce e bloqueio por região. O CSF opera com um nível de abstração com o iptables, a sua administração ocorre de forma mais simples, vamos abordar aqui alguns conceitos básicos e em seguida algumas configurações para conter ataques em serviços web.

Antes de começarmos é interessante informar que o CSF pode ser instalado nos seguintes sistemas:

```
RedHat Enterprise v6 to v8
CentOS v6 - v8
CloudLinux v6 - v8
Fedora v30
openSUSE v10 - v12
Debian v8 - v10
Ubuntu v18 - v20
Slackware v12
```

Segue o processo de instalação do CSF:

```
cd /usr/src
rm -fv csf.tgz
wget https://download.configserver.com/csf.tgz
tar -xzf csf.tgz
cd csf
sh install.sh
```

Depois de instalado, é necessário validar se o seu servidor já possui os módulos do iptables necessário para o CSF:

```
perl /usr/local/csf/bin/csftest.pl

Talvez os pacotes abaixo precisem ser instalado
yum install perl-libwww-perl.noarch perl-LWP-Protocol-https.noarch perl-GDGraph
```

Após a instalação, basta executar o comando `csf -s` para inicializar o serviço, com o CSF inicializado, temos alguns comandos bem simples para o seu gerenciamento, por exemplo para reinicializar e parar o CSF temos os seguintes comandos:

```
# Flush/Parar firewall
csf -f

# Reiniciar o firewall e as regras
csf -r
```

Para Liberar ou bloquear um IP basta utilizar a seguinte estrutura:

```
# Libera o IP e adiciona no arquivo de allow /etc/csf/csf.allow
csf -a [IP.add.re.ss] [comment]	

# Bloqueia o IP e adiciona no arquivo de deny /etc/csf/csf.deny
csf -d [IP.add.re.ss] [comment]	

# Remove o bloqueio do IP do e remove do arquivo /etc/csf/csf.deny
csf -dr [IP.add.re.ss]

# Remove e libera todas as entradas do arquivo /etc/csf/csf.deny
csf -df
```



É possível também realizar consultas a bloqueios temporários, consultas por IP e realizar liberações por porta:

```
# Consulta nas regras do iptables e ip6tables (por exemplo, IP, CIDR, número da porta)
csf -g [IP.add.re.ss]

# Lista todas os bloqueios e liberações temporárias
csf -t	

# Remova um IP da proibição temporária de IP ou da lista de permissões.
csf -tr [IP.add.re.ss]

# Libera todos os IPs das entradas temporárias
csf -tf

# Sintax para permitir que um IP use uma porta determinada em csf.allow
192.168.1.2:22
```



Além dessa interface por linha de comando, o CSF possui um arquivo de configuração no qual é possível determinar as portas TCP e UDP que devem ser liberadas ou é possível realizar a liberação através do arquivo csf.allow com a sintaxe de `ip:pora`, o caminho direto para o arquivo é o `/etc/csf/csf.conf`.

Como dito anteriormente, é possível configurar alguns parâmetros no arquivo de configuração do CSF para limitar e mitigar ataques DoS, para isso trabalharemos da seguinte forma:

1. Limitação de conexão
2. Proteção Port Flood
3. Rastreio de conexão
4. Proteção Synflood



# Limitação de conexão (CONNLIMIT)

Essa opção pode ser usada para limitar o uso de recursos/limite de conexões de um endereço de IP específico, limitando o número de novas conexões por endereço de IP, isso pode ser feito para portas específicas. Por exemplo, é normal que durante um ataque limitemos as conexões dos principais serviços como serviço web e ssh, por exemplo, limitaremos em 20 novas conexões, basta buscar por `CONNLIMIT = ""` no arquivo de configuração do CSF e aplicar a seguinte personalização:

```
# A limitação se da por porta:limite 
CONNLIMIT = "80;20,443;20"


```



# Proteção Port Flood

Essa opção limita o número de conexões por intervalo de tempo para novas conexões feitas em portas específicas. PORTFLOOD é utilizado da seguinte forma: "porta;protocolo;número_de_hits;intervalo_em_segundos", basta buscar por `PORTFLOOD = ""`

```
PORTFLOOD = "80;tcp;20;5,443;tcp;20;5"
```



A configuração `"PORTA;tcp;20;5"` irá bloquear qualquer um que tiver mais de 20 requisições na porta 80 em 5 segundos.

# Rastreio de Conexão

Ativar a opção `CT_LIMIT` fará com que o firewall comece a realizar o rastreio de todas as conexões de endereços de IP para o seu servidor. Ele opera de forma bem simples, se o total de conexões for maior que o valor configurado, então o endereço de IP em questão será bloqueado. Isso pode ser usado para prevenir alguns tipos de ataques DoS. Nesse caso estaremos configurando as opções `CT_LIMIT = "0"` e `CT_INTERVAL = "30"`:

```
CT_LIMIT = 300
CT_INTERVAL = 30
```



# **Proteção Synflood**

Essa opção ajusta o iptables para fornecer uma proteção referente a tentativas de envio de pacotes TCP / SYN. Você deve ajustar o RATE para que os falsos-positivos sejam mínimos, dessa forma a configuração mais indicada para ataque desse gênero é a seguinte: 

```
SYNFLOOD = "1"
SYNFLOOD_RATE = "100/s"
SYNFLOOD_BURST = "150"
```



Bom pessoal, espero que tenham curtido, foi um material bem extenso mas que agregará bastante na segurança dos serviços evitando que o seu ambiente fique fora do ar. 

Valeu!
