---
image: assets/img/openvpn.png
title: OpenVPN para utilização Client to Server
description: >-
  O OpenVPN é uma solução VPN Secure Socket Layer (SSL) de recursos completos
  que acomoda uma ampla variedade de configurações.
date: '2020-01-30 08:56:50'
category: linux
background: '#EE0000'
tags:
  - vpn
---
Neste tutorial, você configurará o OpenVPN em um servidor CentOS 7 e, em seguida, o configurará para ser acessível a partir de uma máquina cliente.Neste tutorial, você configurará o OpenVPN em um servidor CentOS 7 e, em seguida, o configurará para ser acessível a partir de uma máquina cliente.

### Instalando o OpenVPN:
Para começar, vamos instalar o OpenVPN no servidor. Prosseguiremos também com a instalação do Easy RSA, uma ferramenta de gerenciamento de infraestrutura de chave pública que nos ajudará a configurar uma autoridade de certificação (CA) interna para uso com nossa VPN.
Faça o login no servidor como usuário root e atualize as listas de pacotes para certificar-se de ter todas as versões mais recentes.

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

OpenVPN possui exemplos de arquivos de configuração em seu diretório de documentação. Vamos copiar o arquivo server.conf para iniciarmos a configuração do nosso servidor VPN.

```bash
cp /usr/share/doc/openvpn-*/sample/sample-config-files/server.conf /etc/openvpn
```

Vamos abrir o arquivo para edição, utilize o editor cujo se sinta confortável.

```bash
vi /etc/openvpn/server.conf
```

Seguiremos com algumas alterações, é possível observar que a maioria das linhas estão comentadas, para fazer valer a regra só precisa remover " ; ". Quando gerarmos as chaves mais tarde, o padrão de criptografia Diffie-Hellman para o Easy RSA será 2048 bytes, portanto, precisamos alterar o nome do arquivo dh para dh2048.pem.

```bash
dh dh2048.pem
```

Precisamos remover o comentário da linha "redirect-gateway def1 bypass-dhcp", que informa ao cliente para redirecionar todo o tráfego através de nosso OpenVPN.

```bash
push "redirect-gateway def1 bypass-dhcp"
```

Em seguida, é necessário fornecer os servidores DNS ao cliente,vamos usar os servidores de DNS públicos do Google, 8.8.8.8 e 8.8.4.4. Faça isso removendo o comentário de push "dhcp-option DNS lines" e atualizando os endereços IP.

```bash
push "dhcp-option DNS 8.8.8.8"
push "dhcp-option DNS 8.8.4.4"
```

Queremos que o OpenVPN seja executado sem privilégios uma vez iniciado, por isso precisamos dizer-lhe para executar com um usuário e grupo de ninguém. Para ativar isso, é necessário remover o comentário dessas linhas:

```bash
user nobody
group nobody
```

Feito isso, salve e saia do arquivo de configuração do servidor OpenVPN.
