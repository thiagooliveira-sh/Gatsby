---
image: /assets/img/Zabbix.png
title: Configuração Zabbix Server com Grafana
description: >-
  Aprenda como instalar e configurar um servidor Zabbix e realizar a integração
  com o Grafana
date: '2020-02-19'
category: linux
background: '#EE0000'
tags:
  - Zabbix
  - Grafana
  - Monitoramento
  - Linux
  - CentOs
---
O Zabbix é uma excelente ferramenta de monitoramento que coleta dados de servidores, máquinas virtuais e outros tipos de dispositivos de rede, alertando sempre que um problema for identificado. Possui também notificações ricas em recursos sobre problemas emergentes, apesar de ser uma ferramenta poderosa quando se fala em software de monitoramento de ativos de rede, o mesmo ainda carece de dashboards mais amigáveis e com isso temos o Grafana, que é um plugin que consome a API do Zabbix e realiza a criação de diversos dashboards e gráficos de forma muito mais simplificada.

Nesse artigo iremos configurar e instalar o Zabbix server em um servidor CentOs7 e posteriormente será feito a sua integração com o Grafana, no qual realizaremos algumas configurações com as informações monitoradas a partir do Zabbix server.

Com uma instalação limpa do CentOs iremos seguir primeiro desabilitando o firewalld e o selinux porém sinta-se livre para caso deseje trabalhar com esses serviços ativos.

```bash
systemctl stop firewalld
systemctl disable firewalld
```

Para desativar o selinux basta acessar o arquivo de configuração e mudar para disabled, lembrando que para mudança no selinux é necessário um reinicialização para aplicar as modificações:

```bash
vi /etc/selinux/config
SELINUX=disabled
reboot
```

Após feito, vamos adicionar o repositório do Zabbix e fazer a instalação dos pacotes:

```bash
rpm -ivh https://repo.zabbix.com/zabbix/4.5/rhel/7/x86_64/zabbix-release-4.5-2.el7.noarch.rpm
```

O processo de instalação do Zabbix via repositório é bem simples, basta executar o comando abaixo:

```bash
yum install -y zabbix-server-mysql zabbix-web-mysql zabbix-agent
```

### Instalação MariaDB

Será feito a instalação do MariaDB como serviço de banco de dados, pois é considerado o SGDB mais utilizado pelo Zabbix e suas releases de atualização vem com bastantes novidades. 

```bash
vi /etc/yum.repos.d/MariaDB.repo
[mariadb]
name = MariaDB
baseurl = http://yum.mariadb.org/10.3/centos7-amd64
gpgkey=https://yum.mariadb.org/RPM-GPG-KEY-MariaDB
gpgcheck=1
```

Após ter adicionado o repositório do MariaDB no /etc/yum.repos.d/MariaDB.repo basta realizar um update no yum e seguir com as instalações:

```bash
yum update -y
yum install -y MariaDB-server MariaDB-client MariaDB-devel
```

Após a instalação execute os comandos para habilitar e iniciar o serviço:

```bash
sudo systemctl enable mariadb
sudo systemctl start mariadb
```

Em seguida execute o comando mysql_secure_installation para fazer ajustes de segurança:

```bash
mysql_secure_installation
Enter current password for root (enter for none): <ENTER>
Set root password? [Y/n] y
New password:  < INSIRA UMA SENHA >
Re-enter new password: <REPITIR A SENHA>
Remove anonymous users? [Y/n] y
Disallow root login remotely? [Y/n] y
Remove test database and access to it? [Y/n] y
Reload privilege tables now? [Y/n] y
```

FEito a configuração, crie a base de dados e o usuário para o Zabbix e em seguida exportaremos as tabelas necessária para o funcionamento do software:

```bash
$ mysql -p -uroot
MariaDB>create database zabbix character set utf8 collate utf8_bin;
MariaDB>grant all privileges on zabbix.* to zabbix@localhost identified by 'zabbix';
MariaDB>flush privileges;
MariaDB>exit
Bye
```

Importe os schemas e os dados para funcionamento do Zabbix Server, na versão 4.5.2 o zabbix-server-mysql vem na versão 5.0:

```bash
zcat /usr/share/doc/zabbix-server-mysql-5.0.0/create.sql.gz | mysql -uzabbix -p zabbix
```

Feito a importação, basta seguir com a configuração no arquivo de configuração do Zabbix ajustando o banco de dados e suas credencias de acesso:

```bash
vi /etc/zabbix/zabbix_server.conf
DBHost=localhost
DBName=zabbix
DBUser=zabbix
DBPassword=<SENHA_DO_USUARIO>
```

Logo em seguida habilite e inicie o serviço:

```bash
sudo systemctl enable zabbix-server
sudo systemctl start zabbix-server
```

### Instalação Nginx

Agora será feito a instalação do Nginx e do php-fpm, mas antes é necessário instalar o epel-release:

```bash
yum install -y epel-release
yum install -y nginx php-fpm php-common
```

Com o nginx instalado, basta seguir com a configuração do Virtual Host, vou deixar um [link direto](https://gist.githubusercontent.com/thiagoalexandria/593a285acafd4e7e5c7441cbc28c0529/raw/caed91256c59bce2eee4ba807faea04c7afb188e/Nginx-zabbix.conf) para um pré configurado e a partir dele podem fazer as suas personalizações, o arquivo deve ser criado no path abaixo

```bash
vi /etc/nginx/conf.d/zabbix.conf
```

Configure o pool para php-fpm da seguinte forma:

```bash
mkdir /var/lib/php/zabbix-php-fpm
chmod 770 /var/lib/php/zabbix-php-fpm/
chown root:nginx /var/lib/php/zabbix-php-fpm/
chown nginx:nginx /etc/zabbix/web/
```

Crie o arquivo zabbix.conf no /etc/php-fpm.d/ tendo como referencia o seguinte [arquivo](https://gist.githubusercontent.com/thiagoalexandria/ddbb3feda4d7754d5dbed3bb1da78f4b/raw/2b742235aba84aab4afea1b4915e9184550cbb06/PHP-FPM.zabbix.conf), feito a configuração, basta habilitar e iniciar os serviços:

```bash
systemctl enable php-fpm
systemctl enable nginx
systemctl start php-fpm
systemctl start nginx
```

Após iniciar os serviços, basta seguir com a finalização da configuração do Zabbix através do Browser em http://<<server_ou_ip>/zabbix, o processo seguinte é bastante intuitivo, basta completar com as informações de banco de dados e portas.

### Instalação e integração com Grafana

Nesse passo, será feito a instalação do Grafana em outro servidor, também CentOs 7, e esse será alimentado pela as informações do servidor Zabbix. Nesse cenário o mesmo também pode ser feito através de outro contêiner, o objetivo é apenas evitar a concentração de todos os serviços em um único servidor.

Para que possamos seguir com a instalação do Grafana em sua última versão, iremos adicionar o seu repositório no yum.repo:

```bash
vi /etc/yum.repos.d/grafana.repo
[grafana]
name=grafana
baseurl=https://packages.grafana.com/enterprise/rpm
repo_gpgcheck=1
enabled=1
gpgcheck=1
gpgkey=https://packages.grafana.com/gpg.key
sslverify=1
sslcacert=/etc/pki/tls/certs/ca-bundle.crt
```

Feito isso, basta seguir com a instalação utilizando o yum:

```bash
yum install -y grafana
```

Realizaremos também a instalação do Nginx, basta seguir os mesmos passos feitos para o Zabbix, feito a instalação siga com a criação do Virtual Host, segue o [arquivo modelo](https://gist.githubusercontent.com/thiagoalexandria/c0d2debc189f4ab1d4bee75e9c4390cc/raw/84eb3483eca60ddc2f4cd3cddf1de6cdd38f7c30/Nginx-grafana.conf) para consulta:

```bash
vi /etc/nginx/conf.d/grafana.conf
```

Agora será feito a instalação do plugin do Zabbix para o Grafana, utilizaremos o seguinte comando para isso:

```bash
grafana-cli plugins install alexanderzobnin-zabbix-app
systemctl restart grafana-server
```

Reiniciado o nginx, você deve ativar o plug-in, na interface da web, vá para a configuração e o plug-in. Basta seguir com o acesso através http://<<server_ou_ip>/grafana as credenciais padrões para acesso são :

```
user: admin
pass: admin
```

Em "Configuration > Plugins" busque por Zabbix e clique em "Enable". Agora será possível adicionar uma nova data source. Clique na logo do Grafana e navegue até Data sources. Em seguida, clique no botão Add data source. Você verá a página de configuração da fonte de dados:

![Zabbix-datasource](/assets/img/1.png "Zabbix-datasource")



Configure da seguinte forma:

```
Digite um nome para esta data source no campo Name.
Marque a opção Padrão para que essa data source seja pré-selecionada nos painéis que você criar.
Selecione Zabbix na lista Type.
Preencha o campo URL com o caminho completo para a API do Zabbix, que será http: //your_zabbix_server_ip_address/zabbix/api_jsonrpc.php.
Preencha os campos Username e Password com o nome de usuário e a senha do Zabbix.
Habilite a opção Trends; aumentará o desempenho da Grafana.
```



Pronto, o nosso servidor Grafana já encontra-se integrado com o nosso servidor Zabbix e dessa forma basta seguir com a criação dos dashboards de acordo com a necessidade dos itens a serem monitorados.



Fontes:
https://www.zabbix.com/documentation/5.0/manual/installation/install_from_packages/frontend_on_rhel7
https://www.zabbix.com/documentation/5.0/manual/appendix/install/nginx
https://grafana.com/docs/grafana/latest/installation/rpm/
https://grafana.com/docs/grafana/latest/installation/behind_proxy/
