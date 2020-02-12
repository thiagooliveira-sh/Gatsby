---
image: /assets/img/openvpn.png
title: OpenVPN para utilização Client to Server
description: >-
  O OpenVPN é uma solução VPN Secure Socket Layer (SSL) de recursos completos
  que acomoda uma ampla variedade de configurações.
date: '2020-02-12 19:28:50'
category: linux
background: '#EE0000'
tags:
  - vpn
categories:
  - Openvpn
---
Neste tutorial, você configurará o OpenVPN em um servidor CentOS 7 e, em seguida, o configurará para ser acessível a partir de uma máquina cliente.Neste tutorial, você configurará o OpenVPN em um servidor CentOS 7 e, em seguida, o configurará para ser acessível a partir de uma máquina cliente.

### Instalando o OpenVPN:

Para começar, vamos instalar o OpenVPN no servidor. Prosseguiremos também com a instalação do Easy RSA, uma ferramenta de gerenciamento de infraestrutura de chave pública que nos ajudará a configurar uma autoridade de certificação (CA) interna para uso com nossa VPN. Faça o login no servidor como usuário root e atualize as listas de pacotes para certificar-se de ter todas as versões mais recentes.

```bash
yum update -y
```

O repositório Extra Packages for Enterprise Linux (EPEL) é um repositório adicional gerenciado pelo Projeto Fedora contendo pacotes que não são padrões. O OpenVPN não está disponível nos repositórios padrões do CentOS, mas está disponível no EPEL, então instale o EPEL com o seguinte comando:

```bash
yum install epel-release -y
```

Atualizaremos novamente a lista de pacotes e em seguida a instalação do OpenVPN:

```bash
yum update -y && yum install -y openvpn easy-rsa
```

Primeiro crie uma cópia do diretório easy-rsa do sistema para o /etc/openvpn/easyrsa:

```bash
mkdir -p /etc/openvpn/easyrsa
cd /usr/share/easy-rsa/3.0.X
cp -rf * /etc/openvpn/easyrsa && cd /etc/openvpn/easyrsa
```

Com os arquivos copiados, inicialize o easry-rsa pki, o processo de inicialização limpa o conteúdo do diretório pki no easy-rsa 3 e cria os subdiretórios private e reqs:

```bash
[root@localhost easyrsa] # ./easyrsa init-pki
init-pki completo; agora você pode criar uma CA ou solicitações.
Seu diretório PKI recém-criado é: /etc/openvpn/easyrsa/pki
```

Para gerar o certificado CA basta utilizar o sub comando build-ca,você será solicitado a fornecer uma senha para sua chave CA, juntamente com algumas informações organizacionais. Você precisará digitar essa senha sempre que assinar uma solicitação de certificado para um servidor ou certificado de cliente:

```bash
[root@localhost easyrsa]# ./easyrsa build-ca
Generating a 2048 bit RSA private key
...........................+++
...........................................+++
writing new private key to '/etc/openvpn/easyrsa/pki/private/ca.key.docNHm1tdU'
Enter PEM pass phrase:
Verifying - Enter PEM pass phrase:
-----
You are about to be asked to enter information that will be incorporated
into your certificate request.
What you are about to enter is what is called a Distinguished Name or a DN.
There are quite a few fields but you can leave some blank
For some fields there will be a default value,
If you enter '.', the field will be left blank.
-----
Common Name (eg: your user, host, or server name) [Easy-RSA CA]:server

CA creation complete and you may now import and sign cert requests.
Your new CA certificate file for publishing is at:
/etc/openvpn/easyrsa/pki/ca.crt
```

Em seguida, execute comandos para inicializar e criar seus arquivos CA e gerar parâmetros Diffie-Hellman no easy-rsa 3.

```bash
[root@localhost easyrsa]# ./easyrsa gen-dh
Generating DH parameters, 2048 bit long safe prime, generator 2
This is going to take a long time
.....................................................+........................................................................+...+..............++*++*

DH parameters of size 2048 created at /etc/openvpn/easyrsa/pki/dh.pem
```

Em seguida, gere um certificado para o servidor OpenVPN e assine-o. No exemplo abaixo, criamos uma chave chamada "*server*" para corresponder às chaves que referenciamos em nosso arquivo de configuração do servidor. Criamos esse certificado sem uma senha para que o servidor OpenVPN possa acessá-lo sem exigir a interação do sysadmin a cada vez, mas você será solicitado a fornecer a senha do *ca* criado anteriormente ao assinar o certificado do servidor:

```bash
[root@localhost easyrsa]# ./easyrsa gen-req server nopass
Generating a 2048 bit RSA private key
.....................................+++
.........................................+++
writing new private key to '/etc/openvpn/easyrsa/pki/private/server.key.c8WE211mjv'
-----
You are about to be asked to enter information that will be incorporated
into your certificate request.
What you are about to enter is what is called a Distinguished Name or a DN.
There are quite a few fields but you can leave some blank
For some fields there will be a default value,
If you enter '.', the field will be left blank.
-----
Common Name (eg: your user, host, or server name) [server]:

Keypair and certificate request completed. Your files are:
req: /etc/openvpn/easyrsa/pki/reqs/server.req
key: /etc/openvpn/easyrsa/pki/private/server.key
```

```bash
[root@server easyrsa]# ./easyrsa sign server server

You are about to sign the following certificate.
Please check over the details shown below for accuracy. Note that this request
has not been cryptographically verified. Please be sure it came from a trusted
source or that you have verified the request checksum with the sender.

Request subject, to be signed as a server certificate for 3650 days:

subject=
    commonName                = server

Type the word 'yes' to continue, or any other input to abort.
  Confirm request details: yes
Using configuration from ./openssl-1.0.cnf
Enter pass phrase for /etc/openvpn/easyrsa/pki/private/ca.key:
Check that the request matches the signature
Signature ok
```

Agora criamos um diretório keys e copiamos as chaves e certificados importantes que precisamos para o servidor OpenVPN a partir do diretório easy-rsa:

```bash
mkdir /etc/openvpn/easyrsa/keys/
chmod 750 /etc/openvpn/easyrsa/keys
cp -a /etc/openvpn/easyrsa/pki/ca.crt /etc/openvpn/easyrsa/keys
cp -a /etc/openvpn/easyrsa/pki/dh.pem /etc/openvpn/easyrsa/keysdh2048.pem
cp -a /etc/openvpn/easyrsa/pki/issued/server.crt /etc/openvpn/easyrsa/keys/
cp -a /etc/openvpn/easyrsa/pki/private/server.key /etc/openvpn/easyrsa/keys
```

#### Configuração do server.conf

OpenVPN possui exemplos de arquivos de configuração em seu diretório de documentação. Vamos copiar o arquivo server.conf para iniciarmos a configuração do nosso servidor VPN.

```bash
cp /usr/share/doc/openvpn-*/sample/sample-config-files/server.conf /etc/openvpn
```

Vou deixar um link para o arquivo de configuração "enxuto" no [Gist](https://gist.githubusercontent.com/thiagoalexandria/4b419a2fb9cc8962290a2d0950ccb210/raw/44eab659ab7b1f04262ff6c97bb133841394c1c0/openvpn-server.conf), assim basta alterar apenas as informações de "server" para o seu host. Em seguida basta seguir desabilitando o firewalld e selinux (após ajustar o selinux é necessário reiniciar).

```bash
systemctl stop firewalld
systemctl disable firewalld
sed -i "s/SELINUX=enforcing/SELINUX=disabled/" /etc/selinux/config 
reboot
```

Após a reinicialização, libere o NAT para o funcionamento do openvpn:

```bash
iptables -t nat -A POSTROUTING -s 10.8.0.0/24 -o eth0 -j MASQUERADE
```

Com todas as configurações realizadas, ativaremos e iniciaremos o serviço do openvpn:

```bash
systemctl enable openvpn@server
systemctl start openvpn@server
systemctl status openvpn@server   
```

#### Gerando certificados para cliente

Será utilizado o script easyrsa, acesse o diretório /etc/openvpn/easyrsa, no exemplo seguiremos com a criação de um certificado para o cliente "Teste" passando o parâmetro "***nopass***" para não ser necessário atribuir uma senha:

```bash
[root@localhost easyrsa]# ./easyrsa gen-req  Teste nopass
Generating a 2048 bit RSA private key
.............+++
...........................................................................................................+++
writing new private key to '/etc/openvpn/easyrsa/pki/private/Teste.key.3h2S55BG8q'
-----
You are about to be asked to enter information that will be incorporated
into your certificate request.
What you are about to enter is what is called a Distinguished Name or a DN.
There are quite a few fields but you can leave some blank
For some fields there will be a default value,
If you enter '.', the field will be left blank.
-----
Common Name (eg: your user, host, or server name) [Teste]:

Keypair and certificate request completed. Your files are:
req: /etc/openvpn/easyrsa/pki/reqs/Teste.req
key: /etc/openvpn/easyrsa/pki/private/Teste.key
```

Criado o certificado, basta assinar cliente, lembre-se de inserir a senha do CA:

```bash
[root@localhost easyrsa]# ./easyrsa sign client Teste

You are about to sign the following certificate.
Please check over the details shown below for accuracy. Note that this request
has not been cryptographically verified. Please be sure it came from a trusted
source or that you have verified the request checksum with the sender.

Request subject, to be signed as a client certificate for 3650 days:

subject=
    commonName                = Teste

Type the word 'yes' to continue, or any other input to abort.
  Confirm request details: yes
Using configuration from ./openssl-1.0.cnf
Enter pass phrase for /etc/openvpn/easy-rsa/pki/private/ca.key:
Check that the request matches the signature
Signature ok
The Subject's Distinguished Name is as follows
commonName            :ASN.1 12:'Teste'
Certificate is to be certified until Apr 13 14:11:20 2029 GMT (3650 days)

Write out database with 1 new entries
Data Base Updated

Certificate created at: /etc/openvpn/easyrsa/pki/issued/Teste.crt
```

Copie as chaves do cliente para o diretório de keys

```bash
cp -a /etc/openvpn/easyrsa/pki/issued/deepak.crt /etc/openvpn/easyrsa/keys/
cp -a /etc/openvpn/easyrsa/pki/private/deepak.key /etc/openvpn/easyrsa/keys/
```

Pronto, basta encaminhar os arquivos criados para o cliente e o ca.crt para a pessoa que vai utilizados, além disso é necessário que encaminhe também um arquivo *.ovpn* para que o cliente inclua no seu cliente, segue um exemplo para [Download](https://gist.githubusercontent.com/thiagoalexandria/c477dad3196128bdff93400c908aa3a2/raw/a540e6621b8a49e930af60ee100d47ea03565490/cliente.ovpn). Basta seguir com a mudança do nome do crt e key conforme o nome gerado para o cliente e ajustar as configurações de server para o seu.

#### Configuração Cliente Windows

Baixar e instalar o programa cliente da [OpenVPN](https://openvpn.net/index.php/open-source/downloads.html). Após a instalação do cliente OpenVPN, acessar a aba Compatibilidade e habilitar a opção "Executar este programa como administrador", feito isso acesse a pasta de instalação do OpenVPN e localizar a pasta config.

```
C:\Arquivos de Programas\OpenVPN\config
C:\Arquivos de Programas (x86)\OpenVPN\config
```

Após extrair o conteúdo do cliente, ca, key, crt e ovpn para subpasta config e realizar o teste de conexão.
