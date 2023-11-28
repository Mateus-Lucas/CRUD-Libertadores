import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Modal, FlatList, Alert, Image, ImageBackground } from 'react-native';
import { Button, Text, TextInput, FAB, Card } from 'react-native-paper';
import { Formik } from 'formik';
import * as Yup from 'yup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/FontAwesome';
import fundo from '../../img/fundo.jpg'
import { BarChart } from 'react-native-chart-kit';
import { ScrollView } from 'react-native-gesture-handler';

export default function Equipes() {
  const [modalVisible, setModalVisible] = useState(false);
  const [data, setData] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  const validationSchema = Yup.object().shape({
    nome: Yup.string()
      .required('O nome é obrigatório'),
    titulos: Yup.string()
      .required('A quantidade de títulos é obrigatória'),
    jogadores: Yup.number()
      .required('A quantidade de jogadores é obrigatória')
      .max(30, 'Deve ter no máximo 30 jogadores')
      .min(22, 'Deve ter no mínimo 22 jogadores'),
    pais: Yup.string()
      .required('O país é obrigatório'),
  });

  useEffect(() => {
    const carregarDadosDoArmazenamento = async () => {
      try {
        const dadosArmazenados = await AsyncStorage.getItem('formData');
        console.log('Dados brutos do AsyncStorage:', dadosArmazenados);

        if (dadosArmazenados) {
          const dadosParseados = JSON.parse(dadosArmazenados);
          console.log('Dados parseados do AsyncStorage:', dadosParseados);

          if (Array.isArray(dadosParseados)) {
            console.log('Dados parseados como array. Adicionando ao estado existente.');
            setData(dadosParseados);
          } else if (typeof dadosParseados === 'object') {
            console.log('Dados parseados como objeto único. Adicionando ao estado existente.');
            setData([dadosParseados]);
          } else {
            console.error('Dados armazenados não são um array ou objeto:', dadosParseados);
          }
        }
      } catch (erro) {
        console.error('Erro ao carregar os dados do AsyncStorage:', erro);
      }
    };

    carregarDadosDoArmazenamento();
  }, []);

  const adicionarItem = async (item) => {
    try {
      const novoItem = {
        ...item,
        id: `item_${data.length + 1}_${Date.now()}`, // Usando um contador para garantir unicidade
      };

      const idExiste = data.some(itemExistente => itemExistente.id === novoItem.id);

      if (idExiste) {
        console.error('ID duplicado detectado:', novoItem.id);
        Toast.show({
          type: 'error',
          text1: 'Erro ao adicionar o item. ID duplicado detectado.',
        });
        return;
      }

      setData([...data, novoItem]); // Atualiza o estado local

      await AsyncStorage.setItem('formData', JSON.stringify([...data, novoItem]));

      Toast.show({
        type: 'success',
        text1: 'Equipe adicionada com sucesso!',
      });
    } catch (erro) {
      console.error('Erro ao adicionar o item:', erro);
      Toast.show({
        type: 'error',
        text1: 'Erro ao adicionar o item. Tente novamente.',
      });
    }
  };

  const editarItem = (item) => {
    setModalVisible(true);
    setSelectedItem(item);
  };

  const excluirItem = async (item) => {
    Alert.alert(
      'Excluir Item',
      `Deseja realmente excluir ${item.nome}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          onPress: async () => {
            const dadosAtualizados = data.filter((i) => i.id !== item.id);
            setData(dadosAtualizados);
            console.log('Dados após exclusão:', dadosAtualizados);
            await AsyncStorage.setItem('equipes', JSON.stringify(dadosAtualizados));
            Toast.show({
              type: 'success',
              text1: 'Item excluído com sucesso!',
            });
          },
        },
      ],
      { cancelable: true }
    );
  };

  const ModalFormulario = ({ visivel, aoFechar }) => {
    const [valoresFormulario, setValoresFormulario] = useState(selectedItem);

    useEffect(() => {
      if (!visivel) {
        setValoresFormulario(null);
        setSelectedItem(null);
      }
    }, [visivel]);

    const enviar = async (valores, { resetForm }) => {
      try {
        if (selectedItem) {
          const dadosAtualizados = data.map((item) =>
            item.id === selectedItem.id ? { ...item, ...valores } : item
          );
          setData(dadosAtualizados);
          await AsyncStorage.setItem('formData', JSON.stringify(dadosAtualizados));
        } else {
          adicionarItem({ id: Date.now().toString(), ...valores });
        }

        Toast.show({
          type: 'success',
          text1: 'Equipe editada com sucesso!',
        });
        resetForm();
        aoFechar();
      } catch (erro) {
        console.error('Erro ao salvar os dados:', erro);
        Toast.show({
          type: 'error',
          text1: 'Erro ao salvar os dados. Tente novamente.',
        });
      }
    };

    return (
      <Modal visible={visivel} animationType="slide" onRequestClose={aoFechar}>
        <ImageBackground
          source={fundo}
          resizeMode="cover"
          style={{ flex: 1 }}
        >

          <View style={styles.container}>
            <Text style={styles.title}>{selectedItem ? 'Editar Item' : 'Nova Equipe'}</Text>
            <Formik
              initialValues={valoresFormulario || { nome: '', titulos: '', jogadores: '', pais: '' }}
              validationSchema={validationSchema}
              onSubmit={enviar}
            >
              {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
                <View>
                  <TextInput
                    label="Nome"
                    onChangeText={handleChange('nome')}
                    onBlur={handleBlur('nome')}
                    value={values.nome}
                    error={touched.nome && errors.nome}
                    style={styles.input}
                  />

                  {touched.nome && errors.nome && (
                    <Text style={{ color: 'red', textAlign: 'center' }}>{errors.nome}</Text>
                  )}

                  <TextInput
                    label="Títulos"
                    onChangeText={handleChange('titulos')}
                    onBlur={handleBlur('titulos')}
                    value={values.titulos.toString()}
                    error={touched.titulos && errors.titulos}
                    keyboardType="numeric"
                    style={styles.input}
                  />

                  {touched.titulos && errors.titulos && (
                    <Text style={{ color: 'red', textAlign: 'center' }}>{errors.titulos}</Text>
                  )}

                  <TextInput
                    label="Jogadores"
                    onChangeText={handleChange('jogadores')}
                    onBlur={handleBlur('jogadores')}
                    value={values.jogadores.toString()}
                    error={touched.jogadores && errors.jogadores}
                    keyboardType="numeric"
                    style={styles.input}
                  />

                  {touched.jogadores && errors.jogadores && (
                    <Text style={{ color: 'red', textAlign: 'center' }}>{errors.jogadores}</Text>
                  )}

                  <TextInput
                    label="País"
                    onChangeText={handleChange('pais')}
                    onBlur={handleBlur('pais')}
                    value={values.pais.toString()}
                    error={touched.age && errors.pais}
                    style={styles.input}
                  />

                  {touched.pais && errors.pais && (
                    <Text style={{ color: 'red', textAlign: 'center' }}>{errors.pais}</Text>
                  )}

                  <View style={styles.containerButton}>
                    <Button
                      mode='contained'
                      onPress={aoFechar}
                      style={[styles.button, styles.voltarButton]}
                    >
                      <Icon name="arrow-left" size={20} color="white" />
                      {'  '}Voltar
                    </Button>

                    <Button
                      mode="contained"
                      onPress={handleSubmit}
                      style={styles.button}
                    >
                      <Icon name="check" size={20} color="white" />
                      {'  '} {selectedItem ? 'Atualizar Time' : 'Cadastrar Time'}
                    </Button>
                  </View>
                </View>
              )}
            </Formik>
          </View>
        </ImageBackground>
      </Modal>
    );
  };

  const jogadoresData = data.map((item) => ({ name: item.nome, jogadores: item.jogadores }));

  return (
    <ImageBackground
      source={fundo}
      resizeMode="cover"
      style={{ flex: 1 }}
    >

      <View style={styles.container}>
        <ScrollView>
          <ScrollView horizontal={true}>

            <BarChart
              data={{
                labels: jogadoresData.map((item) => item.name),
                datasets: [{ data: jogadoresData.map((item) => item.jogadores) }],
              }}
              width={1000}
              height={400}
              chartConfig={{
                backgroundGradientFrom: '#1E2923',
                backgroundGradientTo: '#08130D',
                color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              }}
            />
          </ScrollView>
        </ScrollView>
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card key={item.id} style={styles.card}>
              <Card.Title title={`${item.nome}  `}
                left={(props) => (
                  <Icon name="soccer-ball-o" size={30} color="black" {...props} />
                )}
              />
              <Card.Content>
                <Text>Títulos: {item.titulos}</Text>
                <Text>Jogadores: {item.jogadores}</Text>
                <Text>País: {item.pais}</Text>
              </Card.Content>
              <Card.Actions style={styles.cardActions}>
                <Button mode="outlined" onPress={() => editarItem(item)}>
                  Editar
                </Button>
                <Button mode="outlined" onPress={() => excluirItem(item)}>
                  Excluir
                </Button>
              </Card.Actions>
            </Card>
          )}
        />
        <FAB
          style={styles.fab}
          icon="plus"
          onPress={() => {
            setModalVisible(true);
            setSelectedItem(null);
          }}
        />
        <ModalFormulario visivel={modalVisible} aoFechar={() => setModalVisible(false)} />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  imagem: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: 'white'
  },
  input: {
    marginVertical: 8,
    fontSize: 16,
  },
  containerButton: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
    marginBottom: 30
  },
  button: {
    marginTop: 16,
    backgroundColor: 'blue',
    flexDirection: 'row',
    alignItems: 'center',
  },
  voltarButton: {
    backgroundColor: 'red',
  },
  card: {
    marginVertical: 8,
  },
  cardActions: {
    justifyContent: 'flex-end',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
