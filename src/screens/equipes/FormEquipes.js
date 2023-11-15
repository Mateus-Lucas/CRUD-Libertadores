import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import * as Yup from 'yup';
import axios from 'axios';

export default function FormEquipes({ navigation, route }) {
  const { acao } = route.params;
  const equipeAntiga = route.params.equipe;

  const [nome, setNome] = useState('');
  const [titulos, setTitulos] = useState('');
  const [jogadores, setJogadores] = useState('');
  const [paises, setPaises] = useState([]);
  const [paisSelecionado, setPaisSelecionado] = useState('Benin');
  const [countryInfo, setCountryInfo] = useState(null);
  const [paisesFiltrados, setPaisesFiltrados] = useState([]);
  const [termoPesquisa, setTermoPesquisa] = useState('');
  const [resultadosPesquisa, setResultadosPesquisa] = useState([]);
  const [showMensagemErro, setShowMensagemErro] = useState(false);

  const validationSchema = Yup.object().shape({
    nome: Yup.string().required('Campo obrigatório'),
    titulos: Yup.number().required('Campo obrigatório'),
    jogadores: Yup.number().max(30, 'Deve conter no máximo 30 jogadores').required('Campo obrigatório'),
  });

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button onPress={() => acao(acao)}>
          Algum Texto
        </Button>
      ),
    });
  }, [acao]);

  useEffect(() => {
    const carregarPaises = async () => {
      try {
        const response = await axios.get('https://restcountries.com/v3.1/all');
        const countries = response.data.map((country) => ({
          nome: country.name.common,
        }));
        setPaises(countries);
        setPaisesFiltrados(countries);
      } catch (error) {
        console.error('Erro ao carregar a lista de países', error);
      }
    };

    carregarPaises();
  }, []);

  useEffect(() => {
    if (equipeAntiga) {
      setNome(equipeAntiga.nome);
      setTitulos(equipeAntiga.titulos);
      setJogadores(equipeAntiga.jogadores);
    }
  }, [equipeAntiga]);

  const handleInputChange = (text) => {
    setTermoPesquisa(text);
    const resultados = paises.filter((country) =>
      country.nome.toLowerCase().includes(text.toLowerCase())
    );
    setPaisesFiltrados(resultados);
    setResultadosPesquisa(resultados);
  };

  async function salvar() {
    try {
      await validationSchema.validate({
        nome,
        titulos,
        jogadores,
      });

      setShowMensagemErro(false);

      const novaequipe = {
        nome,
        titulos,
        jogadores,
        pais: paisSelecionado,
      };

      if (equipeAntiga) {
        acao(equipeAntiga, novaequipe);
      } else {
        acao(novaequipe);
      }

      Toast.show({
        type: 'success',
        text1: 'Equipe salva com sucesso!',
      });

      navigation.goBack();
    } catch (error) {
      setShowMensagemErro(true);
      Toast.show({
        type: 'error',
        text1: 'Erro ao salvar a equipe',
        text2: error.message,
      });
    }
  }

  return (
    <View style={styles.container}>
      <Text variant='titleLarge' style={styles.title}>
        {equipeAntiga ? 'Editar Equipe' : 'Adicionar Equipe'}
      </Text>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          label={'Nome'}
          mode='outlined'
          value={nome}
          onChangeText={(text) => setNome(text)}
          onFocus={() => setShowMensagemErro(false)}
        />

        <TextInput
          style={styles.input}
          label={'Títulos'}
          mode='outlined'
          keyboardType='numeric'
          value={titulos}
          onChangeText={(text) => setTitulos(text)}
          onFocus={() => setShowMensagemErro(false)}
          type={'only-numbers'}
        />

        <TextInput
          style={styles.input}
          label={'Jogadores'}
          mode='outlined'
          keyboardType='numeric'
          value={jogadores}
          onChangeText={(text) => setJogadores(text)}
          onFocus={() => setShowMensagemErro(false)}
          type={'only-numbers'}
        />
        <HelperText type="error" visible={parseInt(jogadores, 10) <= 0 || parseInt(jogadores, 10) > 30}>
          Os times podem cadastrar apenas 30 jogadores
        </HelperText>

        <TextInput
          label="Pesquisar País"
          mode="outlined"
          value={termoPesquisa}
          onChangeText={handleInputChange}
        />

        {/* Resultados da pesquisa */}
        {resultadosPesquisa.map((result) => (
          <Text key={result.nome}>{result.nome}</Text>
        ))}

        {showMensagemErro && (
          <Text style={{ color: 'red', textAlign: 'center' }}>Preencha todos os campos!</Text>
        )}
      </View>

      <View style={styles.buttonContainer}>
        <Button style={styles.button} mode='contained-tonal' onPress={() => navigation.goBack()}>
          Voltar
        </Button>

        <Button style={styles.button} mode='contained' onPress={salvar}>
          Salvar
        </Button>
      </View>
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
});
