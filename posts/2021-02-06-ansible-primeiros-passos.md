---
image: /assets/img/ansible-logo.png
title: Ansible Primeiros passos
description: O Ansible é uma ferramenta de automação de código aberto usada para
  configurar servidores, instalar software e executar uma grande variedade de
  tarefas de TI a partir de uma localização central.
date: 2021-02-05
category: devops
background: "#05A6F0"
tags:
  - Ansible
  - Devops
categories:
  - Ansible
  - Devops
---
Embora voltado para administradores de sistema com acesso privilegiado que rotineiramente executam tarefas como instalar e configurar aplicativos, o Ansible também pode ser usado por usuários não privilegiados. Por exemplo, um administrador de banco de dados que usa o ID de login do mysql pode usar o Ansible para criar bancos de dados, adicionar usuários e definir controles de nível de acesso.

Antes de começarmos, é necessário que tenha o Ansible instalado na sua máquina ou na máquina que utilizará para executar os seus playbooks, dessa forma você poderá seguir o processo de instalação através do [site oficial](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html) de acordo com o seu sistema operacional. 

Além disso, é necessário que tenha acesso ssh as máquinas de destino para que o ansible realize as suas configurações, se não definido uma chave SSH ele utilizará a chave padrão do seu usuário.

### Estrutura
Dentro de um projeto Ansible podemos falar que teremos um formato de estrutura padrão a ser seguido, observe:

````
├── hosts
├── main.yml
├── roles
└── vars
````

O arquivo `hosts` será um arquivo servirá como inventário, podemos separar as máquinas por grupos para que granulação da aplicação das regras, por exemplo:

````
[webserver]
192.168.0.3
192.168.0.4

[db]
192.168.1.3
````

Dessa forma, populamos o nosso arquivo de inventário com os grupos `webserver` e `db` especificando qual o endereço das máquinas targets. Os diretórios `vars` e roles` servirão para armazenar as variáveis do projeto e os passos que serão aplicados, respectivamente.

O arquivo `main.yml` faremos a estruturação do projeto e chamada das ações definidas através das roles.

### Comandos

Com a instalação do Ansible, nos deparamos alguns comandos que podem ser utilizados, vamos abordar apenas alguns que julgo mais importante, tendo em vista que vamos iniciar no conteúdo hoje.
 
#### ansible

O comando `ansible` pode ser utilizado para executar alguns playbooks mais simples a nível de comando, sendo possível a execução com alguns módulos. O mais simples, é o módulo ping, para testar a comunicação com as maquinas de destino:

````
ansible -i hosts all -m ping
````

Podemos também utilizar qualquer outro módulo, por exemplo o módulo shell para executarmos algum comando na máquina remota ou coletar alguma informação:

````
ansible -i hosts all -m shell -a "uptime"
````

#### ansible-galaxy

````
ansible-galexe init role_name
````


#### ansible-playbook

Responsável pela execução dos playbooks mais complexos, temos o comando ansible playbook que após estrtururado todo o projeto basta executa-lo passando como parâmetro o arquivo de inventário e o main.yml, observe:

````
ansibe-playbook -i hosts main.yaml
````

#### ansible-vault 
encryption/decryption utility for Ansible data files


### Primeiro Playbook

````
├── hosts
├── main.yml
├── roles
│   └── Install
│       └── tasks
│           └── main.yml
└── vars
    └── vars.yml
````

### Execução

````
ansible-playbook -i hosts main.yaml
````