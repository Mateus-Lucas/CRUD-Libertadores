import { Formik } from 'formik'
import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Button, Text, TextInput } from 'react-native-paper'
import Toast from 'react-native-toast-message'
import * as Yup from 'yup'

export default function FormEquipes({ navigation, route }) {

  const { acao, equipe: equipeAntiga } = route.params || {};

    const [nome, setNome] = useState('');
    const [titulos, setTitulos] = useState('');
    const [jogadores, setJogadores] = useState('');
    const [paises, setPaises] = useState('');

    const validationSchema = Yup.object().shape({
        nome: Yup.string().required(),
        titulos: Yup.string().required(),
        jogadores: Yup.string().required(),
        paises: Yup.string().required(),
    })

    useEffect(() => {

        console.log('equipe -> ', equipeAntiga)

        if (equipeAntiga) {
            setNome(equipeAntiga.nome)
            setTitulos(equipeAntiga.titulos)
            setJogadores(equipeAntiga.jogadores)
            setPaises(equipeAntiga.paises)
        }

    }, [[equipeAntiga]])


    function salvar(novaEquipe) {
        console.log('SALVAR DADOS NOVA equipe -> ', novaEquipe)

        if (equipeAntiga) {
            acao(equipeAntiga, novaEquipe)
        } else {
            acao(novaEquipe)
        }

        Toast.show({
            type: 'success',
            text1: 'equipe salva com sucesso!'
        })

        navigation.goBack()
    }


    return (
        <View style={styles.container}>

            <Text variant='titleLarge' style={styles.title} >{equipeAntiga ? 'Editar equipe' : 'Adicionar equipe'}</Text>

            <Formik
                initialValues={{
                  nome: equipeAntiga ? equipeAntiga.nome : '',
                  titulos: equipeAntiga ? equipeAntiga.titulos : '',
                  jogadores: equipeAntiga ? equipeAntiga.jogadores : '',
                  paises: equipeAntiga ? equipeAntiga.paises : ''
                }}
                validationSchema={validationSchema}
                onSubmit={values => salvar(values)}
            >
                {({ handleChange, handleBlur, handleSubmit, touched, errors, values }) => (
                    <>

                        <View style={styles.inputContainer}>

                            <TextInput
                                style={styles.input}
                                mode='outlined'
                                label='Nome'
                                value={values.nome}
                                onChangeText={handleChange('nome')}
                                onBlur={handleBlur('nome')}
                            />

                            <TextInput
                                style={styles.input}
                                mode='outlined'
                                label='Títulos'
                                value={values.titulos}
                                onChangeText={handleChange('titulos')}
                                onBlur={handleBlur('titulos')}
                            />

                            <TextInput
                                style={styles.input}
                                mode='outlined'
                                label='Jogadores'
                                value={values.jogadores}
                                onChangeText={handleChange('jogadores')}
                                onBlur={handleBlur('jogadores')}
                            />

                            <TextInput
                                style={styles.input}
                                mode='outlined'
                                label='País'
                                value={values.paises}
                                onChangeText={handleChange('paises')}
                                onBlur={handleBlur('paises')}
                            />


                        </View>
                        <View style={styles.buttonContainer}>

                            <Button
                                style={styles.button}
                                mode='contained-tonal'
                                onPress={() => navigation.goBack()}
                            >
                                Voltar
                            </Button>

                            <Button
                                style={styles.button}
                                mode='contained'
                                onPress={handleSubmit}
                            >
                                Salvar
                            </Button>

                        </View>

                    </>

                )}
            </Formik>


        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    title: {
        fontWeight: 'bold',
        margin: 10
    },
    inputContainer: {
        width: '90%',
        flex: 1
    },
    input: {
        margin: 10
    },
    buttonContainer: {
        flexDirection: 'row',
        width: '90%',
        gap: 10,
        marginBottom: 10
    },
    button: {
        flex: 1
    }
})