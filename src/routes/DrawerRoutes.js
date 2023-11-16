
import { createDrawerNavigator } from '@react-navigation/drawer'
import React from 'react'
import Home from '../screens/Inicio'
import StackArtilharia from '../screens/artilharia/StackArtilharia'
import StackJogos from '../screens/jogos/StackJogos'
import StackOverall from '../screens/overall/StackOverall'
import Equipes from '../screens/equipes/Equipes'
import Jogadores from '../screens/jogadores/Jogadores'

const Drawer = createDrawerNavigator()

export default function DrawerRoutes() {
    return (
        <Drawer.Navigator initialRouteName='Início'>
            <Drawer.Screen name="Início" component={Home} />
            <Drawer.Screen name="Artilharia" component={StackArtilharia} />
            <Drawer.Screen name="Equipes" component={Equipes} />
            <Drawer.Screen name="Jogadores" component={Jogadores} />
            <Drawer.Screen name="Jogos" component={StackJogos} />
            <Drawer.Screen name="Overall" component={StackOverall} />
        </Drawer.Navigator>

    )
}