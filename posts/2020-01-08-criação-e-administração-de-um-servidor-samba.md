---
image: assets/img/samba.png
title: Criação e administração de um servidor Samba!
description: Aprenda a criar e configurar um servidor com Samba.
date: '2020-01-07 09:50:00'
category: linux
background: '#EE0000'
tags:
  - samba
  - linux
---
Nesse tutorial estarei explicando como configurar o Samba em um servidor com CentOS 7, exemplificarei o compartilhamento público e seguro. O Samba é um software livre gratuito que provem o compartilhamento de arquivos e impressoras de forma semelhante ao windows.

Primeiramente será demonstrado como prosseguir com a instalação do Samba com compartilhamento público. Para instalar o serviço do Samba, rode:

```bash
yum install -y samba samba-client samba-common
```

Iremos utilizar a versão disponibilizada pelos repositórios do CentOS, sinta-se livre para utilizar a versão desejada.

Para prosseguir com a configuração do Samba, basta seguir para o seu arquivo de configuração /etc/samba/smb.conf. É importante que guarde uma cópia do arquivo original para utilização futuras, para isso basta seguir com a cópia:

```bash
cp /etc/samba/smb.conf /etc/samba/smb.conf.orig
```

Para iniciar com a configuração do arquivo de forma limpa podemos prosseguir com limpeza do arquivo da seguinte forma:

```bash
cat /dev/null >> /etc/samba/smb.conf
```

Após a limpeza, estaremos iniciando as configurações do arquivo, antes disso estarei informando alguns detalhes quanto as tags que podem ser utilizadas, são elas:

\[global]

Define as configurações que afetam o servidor samba de forma global, como o próprio nome já sugere, fazendo efeito em todos os compartilhamentos existentes na máquina. Por exemplo, o grupo de trabalho, nome do servidor, restrições de acesso por nome.

\[homes]

Especifica opções de acesso a diretórios home de usuários, o diretório home é disponibilizado somente para seu dono, após se autenticar no sistema.

\[printers]

Define opções gerais para controle das impressoras do sistema. Este compartilhamento mapeia os nomes de todas as impressoras encontradas no /etc/printcap. Configurações especiais podem ser feitas separadamente.

Então, seguiremos, inicialmente, com a configuração do smb.conf, para iniciar iremos prosseguir com a criação do \[global] da seguinte maneira:

```bash
[global]
# nome da máquina na rede
netbios name = SRV_ARQ
# nome do grupo de trabalho que a máquina pertencerá
workgroup = WORKGROUP
# String que será mostrada junto com a descrição do servidor
server string = Servidor de arquivos com samba
# nível de segurança user somente aceita usuários autenticados após o envio
# de login/senha
security = user
# Conta que será mapeada para o usuário guest
guest account = nobody
```

Com o global devidamente configurado, partiremos para configuração da pasta home dos usuários que irão se conectar ao servidor, para isso configuraremos a tag \[homes]:

```bash
# Mapeia o diretório home do usuário autenticado. 
[homes]
comment = Diretório do Usuário
# Padrão para criação de arquivos no compartilhamento
create mask = 0750
# Padrão para a criação de diretórios no compartilhamento
directory mask = 0750
# Define se o compartilhamento será ou não exibido na procura de rede
browseable = No
```

Para a criação do compartilhamento publico, seguiremos com a seguinte sintaxe:

```bash
[Publico]
comment = Publico
# Caminho da pasta no servidor
path = /samba/Publico
# Permite a conexão sem necessidade de autenticação
public = yes
# Permite modificações 
writable = yes
# Define se o compartilhamento será ou não exibido na procura de rede
browsable =yes
```

Com o arquivo devidamente configurado, precisamos prosseguir com a criação da pasta que será utilizada para armazenamento dos arquivos públicos, note que no path escolhi o caminho /samba/Publico, então iremos criar esse caminho e posteriormente o compartilharemos de fato, utilizando os seguinte comandos:

```bash
mkdir -p /samba/Publico
chcon -t samba_share_t /samba/Publico
```

Desta forma o compartilhamento publico já encontra-se funcional, em um ambiente de produção se fará necessário a liberação das portas que o samba utiliza para utilização do serviço, em um ambiente CentOS7 por padrão é utilizado o firewalld, então para prosseguir com a liberação, basta seguir com os comandos:

```bash
firewall-cmd --permanent --zone=public --add-service=samba
firewall-cmd --reload
```

Caso esteja utilizando diretamente no iptables, basta prosseguir com a liberação das portas UDP 137-138 e TCP 139, 445, note que liberei apenas o trafego gerado na minha interface ens33, que é a interface para minha rede interna, mude de acordo com a sua necessidade.

```bash
iptables -A INPUT -i ens33 -p udp --dport 137:138 -j ACCEPT 
iptables -A INPUT -i ens33 -p tcp --dport 139 -j ACCEPT 
iptables -A INPUT -i ens33 -p tcp --dport 445 -j ACCEPT 
service iptables save 
```

Com todas as configurações realizadas, vamos iniciar o serviço e incluir para inicialização do sistema, para isso basta seguir com os comandos abaixo:

```bash
systemctl enable smb.service
systemctl enable nmb.service
systemctl restart smb.service
systemctl restart nmb.service
```

Agora, através do seu computador, basta acessar a máquina através da descoberta de rede do seu computador, note que o compartilhamento já está ativo:

![Rede](/assets/img/rede.png)
----

![Srv](/assets/img/srv.png)
----

Agora com o compartilhamento público realizado, seguiremos com a realização do compartilhamento privado, seguiremos com a criação da entrada no arquivo de configuração do samba, seguindo o padrão abaixo:

```bash
[Privado]
comment = Compartilhamento Privado
path = /samba/Privado
# Usuário ou grupos válidos
valid users = @privado
guest ok = no
read only = no
writable = yes
browsable = yes
create mask = 0750
directory mask = 0750
```

Prosseguiremos com a criação de compartilhamento da pasta, da mesma forma que realizado para pasta publica:

```bash
mkdir -p /samba/Privado
chcon -t samba_share_t /samba/Privado
```

Com a pasta criada, alteraremos a permissão de acesso e o grupo dono para que apenas as pessoas do grupo “privado” possam acessar, para isso devemos prosseguir com os seguintes comandos:

```bash
chmod 0770 /samba/Privado
chown -R root:privado /samba/Privado
```

Desta forma, apenas os usuários do grupo privado terá acesso a pasta “Privado”, prosseguiremos com a criação de um usuário, inclusão deste no grupo criado e adicionaremos o seu usuário junto ao samba:

```bash
useradd teste
passwd teste
groupadd privado
useradd teste -G privado
smbpasswd -a teste
```

Agora na sua máquina windows, quando realizar a tentativa de acesso a pasta privada, note que será solicitada um login para autenticação, entre com as suas credenciais e o seu usuário terá as permissões de utilização da pasta privada.

Espero que tenham alcançado os objetivos iniciais e entendido um pouco mais sobre a configuração de um servidor com samba, caso tenha alguma dúvida ou note que ficou faltando algo, basta informar!

Fontes:

https://wiki.samba.org/index.php/User_Documentation https://wiki.samba.org/index.php/Setting_up_Samba_as_a_Standalone_Server
