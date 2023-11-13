
import { createDrawerNavigator } from '@react-navigation/drawer'
import React from 'react'
import Home from '../screens/Home'
import StackArtilharia from '../screens/artilharia/StackArtilharia'
import StackEquipes from '../screens/equipes/StackEquipes'
import StackJogadores from '../screens/jogadores/StackJogadores'
import StackJogos from '../screens/jogos/StackJogos'
import StackOverall from '../screens/overall/StackOverall'

const Drawer = createDrawerNavigator()

export default function DrawerRoutes() {
    return (
        <Drawer.Navigator initialRouteName='Início'>
            <Drawer.Screen name="Início" component={Home} />
            <Drawer.Screen name="Artilharia" component={StackArtilharia} />
            <Drawer.Screen name="Equipes" component={StackEquipes} />
            <Drawer.Screen name="Jogadores" component={StackJogadores} />
            <Drawer.Screen name="Jogos" component={StackJogos} />
            <Drawer.Screen name="Overall" component={StackOverall} />
        </Drawer.Navigator>

    )
}