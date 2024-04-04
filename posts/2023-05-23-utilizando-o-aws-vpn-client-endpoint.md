---
image: /assets/img/AWS.png
title: Utilizando o AWS VPN Client Endpoint
description: O AWS VPN Client endpoint é um ponto de acesso que permite aos
  clientes estabelecerem conexões seguras com a AWS por meio de uma rede virtual
  privada.
date: 2024-04-03
category: aws
background: "#FF9900"
tags:
  - aws
  - network
  - vpn
  - segurança
  - conexão
  - privacidade
  - cliente
  - endpoint
  - AWSVPN
  - cvpn-endpoint
  - cvpn
categories:
  - aws
  - network
  - vpn
  - segurança
  - conexão
  - privacidade
  - cliente
  - endpoint
  - AWSVPN
  - cvpn-endpoint
  - cvpn
---
No atual cenário de trabalho remoto e adoção de nuvem, ter uma conectividade segura é essencial para acessar recursos na nuvem da AWS. Nesta postagem do blog, vamos explorar em detalhes a configuração do AWS VPN Client Endpoint, uma solução confiável que permite estabelecer uma conexão segura entre seus dispositivos e a nuvem da AWS. Aprenda como configurar essa ferramenta poderosa e desfrute de uma comunicação segura e eficiente, acessando seus recursos na nuvem de qualquer lugar, a qualquer momento.

## 1. Visão Geral do AWS VPN Client Endpoint

Para começar, vamos entender o que é o AWS VPN Client Endpoint e como ele desempenha um papel fundamental na garantia de uma conectividade segura para acessar a nuvem da AWS. Exploraremos os seguintes tópicos:

### 1.1 O que é o AWS VPN Client Endpoint?

O AWS VPN Client Endpoint é uma solução que permite estabelecer uma conexão segura e criptografada entre dispositivos e a nuvem da AWS. Ele age como um gateway virtual, permitindo que seus dispositivos se conectem à sua infraestrutura na nuvem de forma segura.

### 1.2 Como funciona o AWS VPN Client Endpoint?

O processo de conexão com o AWS VPN Client Endpoint envolve a autenticação dos dispositivos e a criação de um túnel VPN seguro. Ele utiliza protocolos de criptografia robustos para garantir a confidencialidade e integridade dos dados transmitidos durante a comunicação.

### 1.3 Benefícios do AWS VPN Client Endpoint:

* Segurança: A conexão estabelecida com o AWS VPN Client Endpoint é criptografada, protegendo seus dados contra acesso não autorizado.
* Acesso Remoto: Você pode acessar recursos na nuvem da AWS de qualquer lugar, permitindo maior flexibilidade e mobilidade para suas equipes.
* Escalabilidade: O AWS VPN Client Endpoint é capaz de lidar com um grande número de conexões simultâneas, adequando-se às necessidades do seu negócio.
* Gerenciamento Simplificado: A configuração e o gerenciamento do AWS VPN Client Endpoint são simplificados, permitindo uma implementação rápida e fácil.

### 1.4 Cenários de Uso do AWS VPN Client Endpoint:

O AWS VPN Client Endpoint é versátil e pode ser aplicado em diversos cenários, tais como:

* Acesso remoto seguro para equipes distribuídas geograficamente.
* Conexão segura de dispositivos IoT (Internet of Things) à nuvem da AWS.
* Integração de redes locais com a nuvem da AWS.

## 2. Preparação do Ambiente:

Antes de configurar o AWS VPN Client Endpoint, é importante verificar os pré-requisitos necessários. Nesta seção, abordaremos os seguintes pontos:

* É importante que tenha uma conta AWS válida e que sua conta possua ao menos uma VPC
* C﻿rie uma instância EC2
* Configure seu AWS CLI com as credenciais corretas da conta



### 2.1 Criação da instância EC2

Crie uma instância EC2, conecte através do SSM ou SSH, e instale o git

```
sudo yum install git -y
```

A﻿gora vamos seguir algumas etapas para gerar os certificados do server e client e as chaves necessárias para que possamos aplicar a estratégia de Mutual authentication.

### 2.2 Criação das chaves

Execute o seguinte comando para clonar o repositório do easy-rsa na Ec2

```
git clone https://github.com/OpenVPN/easy-rsa.git
```

A﻿cesse o diretório do easyrsa3

```
cd easy-rsa/easyrsa3
```

Inicialize o environment para PKI e crie um novo CA

```
./easyrsa init-pki
./easyrsa build-ca nopass
```

Gere o certificado do server:

```
./easyrsa build-server-full server nopass
```

Gere o certificado e chaves do client promovendo o client name como o seu dominio:

```
./easyrsa build-client-full client1.domain.tld nopass
```

Crie um diretório no servidor e copie os arquivos gerados, após feito acesse o diretório criado:

```
mkdir ~/custom_folder/
cp pki/ca.crt ~/custom_folder/
cp pki/issued/server.crt ~/custom_folder/
cp pki/private/server.key ~/custom_folder/
cp pki/issued/client1.domain.tld.crt ~/custom_folder
cp pki/private/client1.domain.tld.key ~/custom_folder/
cd ~/custom_folder/
```

Crie uma IAM role, ou edite a role usada caso esteja acessando a EC2 através do SSM, adicione a policy AWSCertificateManagerFullAccess para gerenciamento do ACM e em seguida faça o upload do certificado.

```
aws acm import-certificate --certificate fileb://server.crt --private-key fileb://server.key --certificate-chain fileb://ca.crt
aws acm import-certificate --certificate fileb://client1.domain.tld.crt --private-key fileb://client1.domain.tld.key --certificate-chain fileb://ca.crt
```

## 3 Criação e configuração de uma Client VPN Endpoint:

Acesse a interface de Client VPN Ednpoint no console de gerenciamento da AWS e clique em `Create Client VPN endpoint`

[FOTO 1]

Na tela de `Details`, basta preencher com as informações solicitadas como nome do endpoint, descrições e o range de ipv4 que será utilizado pelo client quando acessarmos a VPN.

[FOTO 2]

Em `Authentication` selecione o certificados de server e client e selecione a opção Mutual Authentication:

[FOTO 3]

Em "Other parameters" informe o IP dos servidores DNS, indico inserir como primário o IP do DNS primário da VPC e no secundário um DNS publico como o do google ou cloudflare. Selecione a VPC e um security group, para simplificarmos o processo será atribuido um security group permitindo todo o tráfico no security group, você pode personalizar basedo nos seus requisitos, selecione a opção "Split tunneling" para usar a conexão de VPN para conectar a apenas recursos da AWS. Por fim crie o endpoint.

[FOTO 4]

### 3.1 Associação de sub-redes à Client VPN Endpoint:

Como não associamos ainda nenhum recurso a VPN o status ficará como "Pending Associate", associe as sub-redes relevantes à Client VPN Endpoint para permitir que seus dispositivos se conectem à infraestrutura na nuvem.

[FOTO 5]

Vamos associar a subnet que temos a ec2 criada, clique em "Associate target network" em "Target network" selecione a VPC e a subnet e clique em "Associate target network"

[FOTO 6]

O processo de associação demora um pouco, então basta acompanhar através da interface, enquanto isso vamos criar algumas "Authorization rules" para que consigamos acessar os recursos de infraestrutura, em "Authorization rules" clique em "Add authorization rule":

[FOTO 7]

Em "Destination network" para habilitar o acesso utilize o CIDR da sua VPC e selecione "Allow access t oall users" para simplificarmos:

[FOTO 8]

Feito isso, clique em "Download client configuration" para baixar os arquivos de configurações:

[FOTO 9]

### 3.2 Ajuste o arquivo do client

Abra o arquivo que fez download e adicione duas novas sessões no arquivo:

```
<cert>
</cert>
<key>
</key>
```

Basta popular com as informações dos certificados e chaves geradas anteriormente e adicionar no arquivo dentro das sessões indicadas e salve o arquivo.





## 4. Conectando na VPN

## F﻿im

Configurar um AWS VPN Client Endpoint é uma maneira eficaz de estabelecer uma conexão segura entre seus dispositivos e a nuvem da AWS. Neste artigo, exploramos a importância do AWS VPN Client Endpoint, seus benefícios e como configurá-lo passo a passo. Agora, você está pronto para garantir uma conectividade segura e aproveitar todos os recursos disponíveis na nuvem da AWS, com flexibilidade e confiança. Experimente configurar o AWS VPN Client Endpoint e desfrute de uma conexão segura para acessar a nuvem da AWS de qualquer lugar, a qualquer momento.