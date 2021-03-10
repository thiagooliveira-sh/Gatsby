---
image: /assets/img/ansible-logo.png
title: Ansible Primeiros passos
description: O Ansible é uma ferramenta de automação de código aberto usada para
  configurar servidores, instalar software e executar uma grande variedade de
  tarefas de TI a partir de uma localização central.
date: 2021-03-09
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

Além disso, é necessário que tenha acesso SSH as máquinas de destino para que o Ansible realize as suas configurações, se não definido uma chave SSH ele utilizará a chave padrão do seu usuário. Nesse lab nós utilizaremos máquinas CentOs7.

### Estrutura

Dentro de um projeto Ansible podemos falar que teremos um formato de estrutura padrão a ser seguido, observe:

```
├── hosts
├── main.yml
├── roles
└── vars
```

O arquivo `hosts` será um arquivo servirá como inventário, podemos separar as máquinas por grupos para que granulação da aplicação das regras, por exemplo:

```yaml
[app1]
192.168.0.3

[app2]
192.168.1.3
```

Dessa forma, populamos o nosso arquivo de inventário com os grupos `app1` e `app2` especificando qual o endereço das máquinas targets. Os diretórios `vars` e roles` servirão para armazenar as variáveis do projeto e os passos que serão aplicados, respectivamente.

O arquivo `main.yml` faremos a estruturação do projeto e chamada das ações definidas através das roles.

### Comandos

Com a instalação do Ansible, nos deparamos alguns comandos que podem ser utilizados, vamos abordar apenas alguns que julgo mais importante, tendo em vista que vamos iniciar no conteúdo hoje.

#### ansible

O comando `ansible` pode ser utilizado para executar alguns playbooks mais simples a nível de comando, sendo possível a execução com alguns módulos. O mais simples, é o módulo ping, para testar a comunicação com as maquinas de destino:

```shell
ansible -i hosts all -m ping
```

Podemos também utilizar qualquer outro módulo, por exemplo o módulo shell para executarmos algum comando na máquina remota ou coletar alguma informação:

```shell
ansible -i hosts all -m shell -a "uptime"
```

#### ansible-galaxy

Podemos utilizar o ansible-galaxy para realizar a criação da estrutura das nossas roles, geralmente utilizamos esse comando dentro do diretório que armazenará a role:

```shell
ansible-galexy init role_name
```

#### ansible-playbook

Responsável pela execução dos playbooks mais complexos, executando todas roles configuradas, temos o comando ansible-playbook que após estruturado todo o projeto basta executa-lo passando como parâmetro o arquivo de inventário e o main.yml, observe:

```shell
ansibe-playbook -i hosts main.yaml
```

#### ansible-vault

encryption/decryption utility for Ansible data files

### Primeiro Playbook

Vamos criar o nosso primeiro playbook, vamos defnir da seguinte forma, criaremos uma role para instalação de alguns pacotes em ambas as máquinas e em seguida enviaremos um script apenas para as máquinas do grupo `app2`. 

Dessa forma, vamos criar as nossas roles utilizando o ansible-galay, certifique-se de que a sua estrutura de arquivos já encontra-se semelhante ao que temos abaixo:

```yaml
├── hosts
├── main.yml
├── roles
└── vars
    └── vars.yml
```

Feito isso, acesse o diretório de roles e crie duas roles, da seguinte forma:

```shell
ansible-galexy init install-basics
ansible-galexy init import-files
```

Feito isso, o Ansible irá criar toda a estrutura de roles padrão, nesse ambiente utilizaremos apenas os diretórios de `tasks` e `files` os demais podem ser removidos, ficando dessa forma:

```
├── import-files
│   ├── files
│   ├── README.md
│   ├── tasks
│   │   └── main.yml
└── install-basics
    ├── files
    ├── README.md
    ├── tasks
    └──  └── main.yml
```

#### install-basics

Nesse playbook precisaremos instalar os seguintes pacotes nas máquinas `vim`, `screen`, `epel-release` e o `htop`. Para isso vamos utilizar o módulo do [yum](https://docs.ansible.com/ansible/2.3/yum_module.html) para o Ansible, basicamente a estrutura do módulo e essa:

```yaml
- name: instalação de pacote
  yum:
    name: PROGRAMA
    state: latest
```

Em `PROGRAMA` é necessário inserir o nome do pacote que deseja instalar, no nosso caso vamos colocar um bloco para cada um. Para poder realizar a instalação do htop, é necessário que o epel seja instalado antes e que realizemos o upgrade dos pacotes então ficaremos com a seguinte estrutura

```yaml
---
# tasks file for install-basics

- name: install vim
  yum:
    name: vim
    state: latest

- name: install screen
  yum:
    name: screen
    state: latest

- name: install epel
  yum:
    name: epel-release
    state: latest

- name: upgrade all packages
  yum:
    name: '*'
    state: latest

- name: install htop
  yum:
    name: htop
    state: latest
```

Pronto, feito isso a primeira parte do playbook esta feita, vamos agora configurar a segunda role.

#### import-files

Nessa role enviaremos um arquivo de script apenas para a máquina que estão no grupo `app2`, dessa forma vamos fazer o seguinte, criaremos um arquivo `.sh` no diretório de files, da seguinte maneira:

```
├── import-files
│   ├── files
│   │     └── import.sh
│   ├── README.md
└── ├── tasks
    └──   └── main.yml
```

Feito isso, vamos configurar o nosso main.yml em nossas taks para realizar o envio do arquivo, utilizaremos o módulo de [sincronia](https://docs.ansible.com/ansible/2.3/synchronize_module.html):

```yaml
- name: Enviando script
  synchronize:
    src: files/import.sh
    dest: /tmp/
```

Pronto, nessa role só precisamos dessa configuração para realizarmos o envio. Vamos agora partir para a configuração do nosso main.yml da raiz do projeto, que terá todas as chamadas das roles e seus grupos.

#### Organizando a execução

Para que o nosso playbook saiba o que e onde executar as roles, precisamos especificar no nosso arquivo main.yml da raiz do projeto o passo a passo a ser executado, nele especificaremos onde será executado, com qual usuário ssh e será com permissão sudo. 

Dessa forma, configuraremos que todas as máquinas recebam a instalação dos pacotes e que somente o grupo `app2` receba o script, definiremos da seguinte forma:

```yaml
- hosts: app1
  become: yes
  user: "{{ user }}"
  vars_files:
    - vars/vars.yml
  gather_facts: no
  roles:
  - { role: Install, tags: ["install-basics"]  }

- hosts: app2
  become: yes
  user: "{{ user }}"
  vars_files:
    - vars/vars.yml
  gather_facts: no
  roles:
  - { role: Install, tags: ["install-basics"]  }
  - { role: Import, tags: ["import-files"] }
```

Observe que no campo `user` definimos uma variável `"{{ user }}", vamos configura-la no arquivo de variável então:

```yaml
user: thiago.alexandria
```

Feito isso, o seu playbook encontra-se pronto para execução.

### Execução

A execução de um playbook é feita através do comando `ansible-playbook`, passamos o aruqivo de hosts e o arquivo main como parâmetro de execução, observe: 

```
ansible-playbook -i hosts main.yaml
```

Executado, você receberá na tela uma plano de execução, com as mudanças que o Ansible realiza, esse plano servirá como report, dessa forma você saberá se em algum momento o playbook retorne erro. 

Todo o projeto desenvolvido nesse artigo encontra-se disponível no [github](https://github.com/thiagoalexandria/ansible-post) para consulta e para que possam comparar com os arquivos de vocês.

Caso tenham alguma dúvida, só deixar no campo de comentários! Até a próxima!