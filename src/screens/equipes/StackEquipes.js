import { createStackNavigator } from '@react-navigation/stack'
import ListaEquipes from './ListaEquipes.js'
import FormEquipes from './FormEquipes.js'

const Stack = createStackNavigator()

export default function StackEquipes() {
    return (

        <Stack.Navigator
            screenOptions={{ headerShown: false }}
            initialRouteName='ListaEquipes'
        >
            <Stack.Screen name='ListaEquipes' component={ListaEquipes} />
            <Stack.Screen name='FormEquipes' component={FormEquipes} />
        </Stack.Navigator>

    )
}