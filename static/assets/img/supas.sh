#!/bin/sh
# Last Update: July 26 2019

<< 'CHANGELOG'
1.0 - 10/07/2019 [ Author: Thiago Alexandria ]
            * Initial release
            * Função supas
            * Aliasse principais
1.1 - 13/07 ~ 24/07 [ Author: Thiago Alexandria ]
        * Adição de principais funções usando api do WHM e cPanel
        * Ajustes das funções com validação de contas
        * Correção das seguintes funções
            * reseller_verify
        * Criação das funções abaixo:
            * changemail_password
            * global_spambox
            * autossl
1.2 - 25/07 ~ 29/07 [Author: Thiago Alexandria]
        * Correção de condição de parada nas verificações com if
        * Correção grep para grep -w em funções de verificação
        * Adição do aliase spfxuxu para rotacionamento
        * Adição de novas funções:
            * maillocate_verify
            * checkmx
        * allowremotesmtp
            * roundcubeplugin
        * Ajuste das funções:
            * mail_verify
        * domain_verify
1.3 - 27/11 [Author: Thiago Alexandria]
        * Correção no bug em retornos do grep -w nas funções de validação ( mail_verify, domain_verify ...)
1.4 - 27/01 [Author: Thiago Alexandria]
	    * Criação da função mailogin_history
CHANGELOG


# Função principal, listar todas as funções disponíveis
function supas (){
echo -e "\nAmbiente de Suporte :: Lista de Funcoes\n=======================================\n"
echo -e "-----------------Apache-----------------"
echo -e "apache_status\t\t->\tFullstatus do Apache"
echo -e "edit_http\t\t->\tAbre o arquivo pre_virtualhost_global.conf para edição"
echo -e "restrict_http\t\t->\tBloqueia o acesso web da conta cPanel"
echo -e "-----------------SPAM-----------------"
echo -e "disable_spamdel\t\t->\tDesabilitar Auto Delete do SpamAssassin de uma conta"
echo -e "enable_spamass\t\t->\tAtivar SpamAssassin para uma conta"
echo -e "conf_spamass\t\t->\tConfigurar score do SpamAssassin de uma conta"
echo -e "global_spambox\t\t->\tHabilitar Spam Box para todos do servidor"
echo -e "-----------------EMAIL-----------------"
echo -e "mailogin_history\t->\tRelatório de login das contas de e-mail de um domínio"
echo -e "mail_usage_report\t->\tRelatório de todas as contas de e-mail do servidor"
echo -e "cpusermail_usage\t->\tRelatório das contas de e-mail de uma conta cPanel"
echo -e "changemail_password\t->\tAlterar senha de conta para uma aleatória"
echo -e "nomail\t\t\t->\tDesabilitar envio de e-mail de uma conta cPanel"
echo -e "yesmail\t\t\t->\tHabilitar envio de e-mail de uma conta cPanel"
echo -e "delfrozen\t\t->\tRemover e-mails frozen da fila"
echo -e "deldonmail\t\t->\tRemover e-mails de todo domínio da fila"
echo -e "delusermail\t\t->\tRemover e-mails de uma conta da fila"
echo -e "sendmail\t\t->\tEnviar e-mail"
echo -e "mq\t\t\t->\tFila de e-mail para auditoria"
echo -e "checkmx\t\t\t->\tVerifica roteamento de e-mail e entradas MX do domínio"
echo -e "-----------------WHM-----------------"
echo -e "cpanel_session\t\t->\tAcesso cPanel sem senha"
echo -e "suspend_reseller\t->\tSuspender Reseller"
echo -e "unsuspend_reseller\t->\tRemover suspensão do Reseller"
echo -e "autossl\t\t\t->\tGerar certificado ssl para conta"
echo -e "servicestatus\t\t->\tVerificar status de serviços mais comuns"
echo -e "-----------------cPanel-----------------"
echo -e "restrict_mailacct\t->\tDesabilitar conta de e-mail Login/Envio/Recebimento"
echo -e "unrestrict_mailacct\t->\tRemover bloqueio de conta de e-mail Login/Envio/Recebimento"
echo -e "create_backup\t\t->\tGerar backup da conta em sua home"
echo -e "check_backup\t\t->\tVerificar backups disponíveis para a conta"
echo -e "-----------------Outros-----------------"
echo -e "phpinfo\t\t\t->\tAdiciona o phpinfo no diretório atual"

echo -e "\nEnviar sugestoes para alexandriathiago@gmail.com\n" ;}

supas;

alias ls="ls -al --color=always";export LESS="r";

#PRESCRIPTS
function domain_verify(){
verifydomain=$(grep -w $domain /etc/trueuserdomains | cut -d: -f1 | head -1)

if [ "$verifydomain" != "$domain" ]; then
  echo -e "The domain \033[1;33m$domain\033[0m does not exist: \033[0;31m[ERROR]\033[0m"
  kill -INT $$;
fi;
}

function mail_verify(){
mailuser=$(echo $user | cut -d@ -f1 | head -1)

if [[ ! -d "/home/$account/mail/$domain/$mailuser" ]]; then
  echo -e "The mail account \033[1;33m$user\033[0m does not exist: \033[0;31m[ERROR]\033[0m"
  kill -INT $$;
fi;
}

function acct_verify(){
verifyuser=$(grep -w $user /etc/trueuserdomains | cut -d: -f2 | head -1 | sed 's/ //g' )

if [ "$verifyuser" != "$user" ]; then
  echo -e "The user \033[1;33m$user\033[0m does not exist: \033[0;31m[ERROR]\033[0m"
  kill -INT $$;
fi;
}

function reseller_verify(){
verifyreseller=$(grep -w $user /etc/trueuserowners | cut -d: -f2 | head -1 | sed 's/ //g')

if [ "$verifyreseller" != "$user" ]; then
  echo -e "The user \033[1;33m$user\033[0m are not a reseller: \033[0;31m[ERROR]\033[0m"
  kill -INT $$;
fi;
}

function maillocate_verify(){
local=$(grep -w $domain /etc/localdomains | head -1)

if [ "$local" != "$domain" ]; then
  echo -e "The domain \033[1;33m$domain\033[0m are configured as remote domain "
else
  echo -e "The domain \033[1;33m$domain\033[0m are configured as local domain "
fi;
}

#Apache
function apache_status() {
	/usr/local/apache/bin/apachectl fullstatus;}

function edit_http() { 
	vim /usr/local/apache/conf/includes/pre_virtualhost_global.conf; /scripts/restartsrv_httpd; 
}


function restrict_http() {
SCRIPT_PATH="/scripts/restartsrv_httpd"
NOW=$(date +"%m-%d-%y")
user=${1}
acct_verify
ticket=${2}

echo -e "<Directory \"/home/$user/public_html\">\n  AllowOverride none\n  order deny,allow\n  errordocument 403 \"Temporarily closed for maintenance.\n  #\" ~$agent on $NOW Ticket: $ticket \n</Directory>\n\n" >> /usr/local/apache/conf/includes/pre_virtualhost_global.conf;

"$SCRIPT_PATH";}

function phpinfo() { usuario=$(pwd | cut -d\/ -f3);echo "<?php phpinfo(); ?>" >> phpinfo.php; chmod 644 phpinfo.php; chown $usuario: phpinfo.php;}

function permdatabase() {
echo "Database:"
read database;
echo "User:"
read user;
echo "Pass:"
read pass;

mysql -u root -e "GRANT ALL ON $database.* TO $user@'localhost' IDENTIFIED BY '$pass';"
echo "#finalizado# Teste com a senha informada!"
echo "mysql -u $user -p";}


#EXIM MAIL
function mq() { exim -bp | grep "<*>" | awk {'print $4'} | sort | uniq -c | sort -n ;}
function sendmail() {
origem=${1}
destino=${2}
echo TesteHD |exim -r $origem  -v -odf $destino;
}

function delusermail() {
emailacct=${1}
exiqgrep -i -f $emailacct | xargs exim -Mrm;
}

function deldonmail() {
domain=${1}
exim -bpu | grep $domain | awk {'print $3'} | xargs exim -Mrm;
}

function delfrozen() {
	exim -bpu | grep "<>" | awk '{print $3}' | xargs exim -Mrm;
}

#API CPANEL
#SSL

function autossl(){
user=${1}
acct_verify
SCRIPT_PATH="/usr/local/cpanel/bin/autossl_check"
"$SCRIPT_PATH" --user=$user;
}

#MAIL
function mail_usage_report() { 
	for i in `grep : /etc/trueuserowners | cut -d: -f1`; do echo "cPanelUser:$i" >> apilist ; uapi --user=$i Email list_pops_with_disk >> apilist; >> apilist; done ; sed 's/ //g' apilist > maillist && grep -E '^diskused:|^login:|^cPanelUser:' maillist; rm -rf apilist maillist ;}

function cpusermail_usage() {
user=${1}
acct_verify
uapi --user=$user Email list_pops_with_disk >> apilist; >> apilist; sed 's/ //g' apilist > maillist && grep -E '^diskused:|^login:' maillist; rm -rf apilist maillist; 
}


function nomail() {	
user=${1}
acct_verify
whmapi1 suspend_outgoing_email user=$user >>/dev/null
echo -e "The cPanel account \033[1;33m$user\033[0m have outgoing email suspended ";
}

function yesmail() { 
user=${1}
acct_verify
whmapi1 unsuspend_outgoing_email user=$user >>/dev/null
echo -e "The cPanel account \033[1;33m$user\033[0m have outgoing email unsuspended ";
}

function restrict_mailacct(){
user=${1}
domain=$(echo $user | cut -d@ -f2)
domain_verify
account=$(grep $domain /etc/trueuserdomains | cut -d: -f2 | head -1 | sed 's/ //g')
mail_verify

uapi --user=$account Email suspend_login email=$user >> /dev/null
uapi --user=$account Email suspend_incoming email=$user >> /dev/null
uapi --user=$account Email suspend_outgoing email=$user >> /dev/null

echo -e "The mail account \033[1;33m$user\033[0m are suspended"
}

function unrestrict_mailacct(){
user=${1}
domain=$(echo $user | cut -d@ -f2)
domain_verify
account=$(grep $domain /etc/trueuserdomains | cut -d: -f2 | head -1| sed 's/ //g')
mail_verify

uapi --user=$account Email unsuspend_login email=$user >> /dev/null
uapi --user=$account Email unsuspend_incoming email=$user >> /dev/null
uapi --user=$account Email unsuspend_outgoing email=$user >> /dev/null

echo -e "The mail account \033[1;33m$user\033[0m are unsuspended"
}

function changemail_password(){
user=${1}
domain=$(echo $user | cut -d@ -f2)
domain_verify
account=$(grep $domain /etc/trueuserdomains | cut -d: -f2 | head -1 | sed 's/ //g')
mail_verify

password=$(openssl rand 10 -base64)

uapi --user=$account Email passwd_pop email=$user password=$password domain=$domain >> /dev/null
echo -e "The mail account \033[1;33m$user\033[0m have a new password \033[1;33m$password\033[0m";
}

function checkmx(){
domain=${1}

maillocate_verify

echo -e "\nDNS Mx entries from $domain:"
whmapi1 listmxs domain=$domain | grep exchange:
}

#SPAM
function disable_spamdel() {
user=${1}
acct_verify
uapi --user=$user Email disable_spam_autodelete >> /dev/null
echo -e "Auto Delete do SpamAssassin da conta $user desativada";
}

function enable_spamass() {
user=${1}
acct_verify
uapi --user=$user Email enable_spam_assassin >> /dev/null
echo -e "SpamAssassin da conta $user ativado";
}

function conf_spamass() {
user=${1}
acct_verify
echo "Score:"
read score;
uapi --user=$user SpamAssassin update_user_preference preference=required_score value-0=$score >> /dev/null
echo -e "Atualizado o escore do SpamAssassin da conta $user para $score";
}

function global_spambox(){
whmapi1 set_tweaksetting key=skipspambox value=0 ; for i in `grep : /etc/trueuserowners | cut -d: -f1`; do uapi --user=$i Email enable_spam_box; done
}

#BACKUP
function create_backup() {
user=${1}
acct_verify
uapi --user=$user Backup fullbackup_to_homedir >> /dev/null
echo -e "Backup iniciado com sucesso, verifique a home da conta $user em breve";
}

function check_backup() {
user=${1}
acct_verify
uapi --user=$user Backup list_backups | awk 'NR==6, NR==10 {print NR,$0}' | cut -d':' -f3 | awk '{print $3}';
}

#WHM
function cpanel_session() {
	whmapi1 create_user_session user=root service=whostmgrd locale=en | awk 'NR==8 {print NR,$0}' | cut -d':' -f2- ;
}

function suspend_reseller() {
user=${1}
reseller_verify
echo "Motivo:"
read reason;
whmapi1 suspendreseller user=$user reason=$reason >> /dev/null
echo -e "A revenda do usuário \033[1;33m$user\033[0m foi suspensa pelo seguinte motivo: \033[1;33m$reason\033[0m ";
}

function unsuspend_reseller() {
user=${1};
reseller_verify
whmapi1 unsuspendreseller user=$user >> /dev/null
echo -e "A suspensão da revenda do usuário \033[1;33m$user\033[0m foi removida";
}


function servicestatus(){
services=(tailwatchd httpd mysql exim sshd ftpd crond imap pop)

for i in "${services[@]}"; do 

user=$(whmapi1 servicestatus service=$i | grep running | sed 's/ //g' | cut -d: -f2)

if [ "$user" != "0" ]; then
  echo -e "The \033[1;33m$i\033[0m service are running. \033[0;32m[OK]\033[0m"
else
  echo -e "The \033[1;33m$i\033[0m service is down. \033[0;31m[ERROR]\033[0m"
fi; done;
}


function mailogin_history(){
domain=${1}
domain_verify
user=$(grep $domain /etc/trueuserdomains | cut -d: -f2 | head -1| sed 's/ //g')

ll /home/$user/mail/$domain/ | awk '{print $9}' | sed '/^$/d;s/$/@'$domain'/' > /root/list 

for i in `cat /root/list`; do LAST_LOG=$(grep $i /var/log/maillog | egrep "Login: user=" | tail -1 | cut -d " " -f 1-3); echo -e "útimo acesso da conta: $i foi em: $LAST_LOG" >> /home/$user/last_log; done; sed -E -i '/\.+@/d' /home/$user/last_log

chown $user: /home/$user/last_log
rm -rvf /root/list

echo -e "The mail login history for domain \033[1;33m$domain\033[0m has finished, see /home/$user/last_log";
}
