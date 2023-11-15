import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import * as Yup from 'yup';
import { Formik } from 'formik';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function FormEquipes({ navigation, route }) {

  const { acao, equipes: equipesAntiga } = route.params;
  const [showMensagemErro, setShowMensagemErro] = useState(false);

  const validationSchema = Yup.object().shape({
    nome: Yup.string().required('Campo obrigatório'),
    titulos: Yup.number().required('Campo obrigatório'),
    jogadores: Yup.number().max(30, 'Deve conter no máximo 30 jogadores').required('Campo obrigatório'),
    paises: Yup.string().required('Campo obrigatório'),
  });

  function cadastrar(values) {
    try {
      console.log('equipes: ', values)
      navigation.goBack();
    } catch (error) {
      setShowMensagemErro(true);
      Toast.show({
        type: 'error',
        text1: 'Erro ao salvar a equipes',
        text2: error.message,
      });
    }
  }

  return (
    <View style={styles.container}>
      <Text variant='titleLarge' style={styles.title}>
        {equipesAntiga ? 'Editar equipes' : 'Adicionar equipes'}
      </Text>

      <Formik
        initialValues={{
          nome: equipesAntiga ? equipesAntiga.nome : '',
          titulos: equipesAntiga ? String(equipesAntiga.titulos) : '',
          jogadores: equipesAntiga ? String(equipesAntiga.jogadores) : '',
          paises: equipesAntiga ? equipesAntiga.paises : '',
        }}
        validationSchema={validationSchema}
        onSubmit={async (values) => {
          try {
            await AsyncStorage.setItem('equipes', JSON.stringify(values));
            console.log('Dados salvos no AsyncStorage:', values);
            cadastrar(values);
          } catch (error) {
            setShowMensagemErro(true);
            Toast.show({
              type: 'error',
              text1: 'Erro ao salvar a equipe',
              text2: error.message,
            });
          }
        }}
      >

        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
          setFieldTouched,
          setFieldValue,
        }) => (
          <>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                label={'Nome'}
                placeholder='Ex:. Flamengo'
                mode='outlined'
                value={values.nome}
                onChangeText={handleChange('nome')}
                onBlur={() => setFieldTouched('nome')}
                error={touched.nome && errors.nome}
              />
              {touched.nome && errors.nome && (
                <Text style={styles.errorText}>{errors.nome}</Text>
              )}

              <TextInput
                style={styles.input}
                label={'Títulos'}
                mode='outlined'
                placeholder='0'
                keyboardType='numeric'
                value={values.titulos}
                onChangeText={(text) => setFieldValue('titulos', text)}
                onBlur={() => setFieldTouched('titulos')}
                error={touched.titulos && errors.titulos}
              />
              {touched.titulos && errors.titulos && (
                <Text style={styles.errorText}>{errors.titulos}</Text>
              )}

              <TextInput
                style={styles.input}
                label={'Jogadores'}
                mode='outlined'
                keyboardType='numeric'
                value={values.jogadores}
                onChangeText={(text) => setFieldValue('jogadores', text)}
                onBlur={() => setFieldTouched('jogadores')}
                error={touched.jogadores && errors.jogadores}
              />
              {touched.jogadores && errors.jogadores && (
                <Text style={styles.errorText}>{errors.jogadores}</Text>
              )}

              <TextInput
                style={styles.input}
                label={'País'}
                mode='outlined'
                value={values.paises}
                onChangeText={handleChange('paises')}
                onBlur={() => setFieldTouched('paises')}
                error={touched.paises && errors.paises}
              />
              {touched.paises && errors.paises && (
                <Text style={styles.errorText}>{errors.paises}</Text>
              )}

              {errors.showMensagemErro && (
                <Text style={styles.errorText}>
                  Preencha todos os campos!
                </Text>
              )}
            </View>

            <View style={styles.buttonContainer}>
              <Button
                style={styles.button}
                mode='contained-tonal'
                onPress={() => navigation.goBack()}
              >
                Voltar
              </Button>

              <Button mode='contained' onPress={handleSubmit}>Cadastrar</Button>

            </View>
          </>
        )}
      </Formik>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontWeight: 'bold',
    margin: 10,
  },
  inputContainer: {
    width: '90%',
    flex: 1,
  },
  input: {
    margin: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '90%',
    gap: 10,
    marginBottom: 10,
  },
  button: {
    flex: 1,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 5,
  },
});
