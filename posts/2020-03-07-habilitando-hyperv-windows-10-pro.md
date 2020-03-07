---
image: /assets/img/Hyperv.png
title: 'Habilitando HyperV Windows 10 Pro '
description: >-
  Nesse artigo será demonstrado como habilitar o Hyper-V em máquinas que possuem
  o Windows 10 Pro como sistema operacional e uma breve explicação sobre a
  administração utilizando o PowerShell
date: '2020-03-07'
category: win
background: '#00A82D'
tags:
  - Windows
  - Hyper-V
  - PowerShell
  - Virtualizacao
categories:
  - Windows
  - Hyper-V
  - PowerShell
  - Virtualizacao
---
O Hyper-V é uma tecnologia de virtualização baseada em Hipervisor nativo proprietário da Microsoft e encontra-se presente em alguns de seus sistemas operacionais em forma de feature, podendo também ser encontrado como Hyper-V Os. O Hyper-V encontra-se disponível no Windows 8 e 10 Pro assim como no Windows Server. 

Existem algumas limitações quanto a utilização do Hyper-V em versões Server do Windows porém nesse artigo iremos abordar apenas a sua instalação no Windows 10 pro. Antes de seguir com o procedimento, é necessário que certifique-se sobre alguns pontos cruciais para o funcionamento do Hyper-V, são eles: 

* Windows 10 Enterprise, pro ou Education
* Processador de 64 bits com SLAT (Conversão de Endereços de Segundo Nível).
* Suporte de CPU para extensão do modo de monitor da VM (VT-c em CPUs Intel).
* Mínimo de 4 GB de memória.



Habilite o Hyper-V utilizando o PowerShell, dessa forma execute o mesmo com permissão de administração, após feito, basta executar o seguinte comando:

```powershell
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All
```



Quando a instalação for concluída, será solicitado a reinicialização do computador. Após feito, basta pesquisar por  "Gerenciador do Hyper-V", ao clicar teremos uma imagem semelhante a essa:

![hyperv](/assets/img/hyperv1.png "hyperv")

Através da interface é possível realizar todo o procedimento de gerenciamento e configuração do Hyper-V, a criação de máquinas virtuais ocorre através da opção "Ação" no menu de opções superior além de também ser possível a criação utilizando PowerShell quando necessário a automatização de processos. Irei abordar alguns pontos que julgo necessário e no final seguiremos com a criação de uma máquina virtual utilizando a linha de comando faltando apenas a instalação do sistema operacional.

### Configurações do Hyper-V

O Hyper-V possui algumas configurações padrões, como por exemplo, o local cujo será armazenado os discos virtais e das máquinas virtuais. Acesse a opção "Ação > Configurações do Hyper-V" iremos mudar o local padrão para um disco a parte ao disco principal, nesse caso utilizaremos os seguintes locais para Discos Rígidos Virtuais e Máquinas Virtuais respectivamente:

```
D:\Hyper V\Virtual Hard Disks\
D:\Hyper V\Virtual Machines
```

Também é importante que realizemos a criação de um comutador virtual externo, o comutador é uma interface de rede e o seu tipo determina o que a máquina terá de acesso. Existem três tipos de comutadores, Externo, Interno e Particular:

```
Externo: Comutador que se associa ao adaptador de rede físico de forma que as máquinas virtuais possam acessar uma rede física
Interno: Comutador virtual interno que não fornece conectividade para a conexão de rede física.
Particular: Comutador virtual que só pode ser usado pelas máquinas virtuais.
```



Sabendo a diferença, seguiremos com a criação do comutador externo através do PowerShell, utilizando o seguinte comando:

```powershell
New-VMSwitch -Name Externo -SwitchType external 
```

Com a criação do comutador externo, já poderemos criar máquinas virtuais com acesso a rede física e consequentemente, com acesso a internet. Seguiremos com a criação de uma máquina virtual Teste, para isso basta seguir com a criação utilizando o modulo "New-VM" do Hyper-V:

```powershell
New-VM -Name Teste -Generation 2 -MemoryStartupBytes 1GB -NewVHDPath 'D:\Hyper V\Teste\Teste.vhdx' -NewVHDSizeBytes 100GB
```

Em seguida, associaremos o comutador externo a nossa nova máquina:

```powershell
Connect-VMNetworkAdapter -VMName Teste -SwitchName Externo
```

Basta agora configurar a ISO que será utilizada utilizando o comando Add-VMDvdDrive especificando o path com a iso, da seguinte forma:

```powershell
Add-VMDvdDrive -VMName Teste -Path D:\Iso\Windows.iso
```

Com todos os pontos configurados, basta iniciar a máquina virtual e seguir com a instalação do sistema operacional, utilize os seguinte comandos para iniciar a máquina virtual e em seguida acessa-la:

```powershell
Start-VM -Name Teste
.\vmconnect.exe HOSTNAME Teste 
```

Espero que gostem da perspectiva de configuração e gerenciamento utilizando os cmdlet powershell para gerenciamento do Hyper-V.

Até a próxima!
