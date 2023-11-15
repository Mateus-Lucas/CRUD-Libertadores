import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { useEffect, useState } from 'react'
import { FlatList, StyleSheet, View } from 'react-native'
import { Button, Card, Dialog, FAB, MD3Colors, Portal, Text } from 'react-native-paper'
import Toast from 'react-native-toast-message'


export default function ListaEquipes({ navigation, route }) {

  const [equipes, setEquipes] = useState([])
  const [showModalExcluirUsuario, setShowModalExcluirUsuario] = useState(false)
  const [equipeASerExcluida, setEquipeASerExcluida] = useState(null)


  useEffect(() => {
    loadEquipes()
  }, [])

  async function loadEquipes() {
    const response = await AsyncStorage.getItem('equipes')
    console.log('equipe resgatada: ',response)
    const equipesStorage = response ? JSON.parse(response) : []
    setEquipes(equipesStorage)
  }

  const showModal = () => setShowModalExcluirUsuario(true);

  const hideModal = () => setShowModalExcluirUsuario(false);

  async function adicionarEquipe(equipe) {
    let novaListaEquipes = equipes
    novaListaEquipes.push(equipe)
    await AsyncStorage.setItem('equipes', JSON.stringify(novaListaEquipes));
    setEquipes(novaListaEquipes)
  }

  async function editarEquipe(equipeAntiga, novosDados) {
    console.log('EQUIPE ANTIGA -> ', equipeAntiga)
    console.log('DADOS NOVOS -> ', novosDados)

    const novaListaEquipes = equipes.map(equipe => {
      if (equipe == equipeAntiga) {
        return novosDados
      } else {
        return equipe
      }
    })

    await AsyncStorage.setItem('equipes', JSON.stringify(novaListaEquipes))
    setEquipes(novaListaEquipes)

  }

  async function excluirEquipe(equipe) {
    const novaListaEquipes = equipes.filter(p => p !== equipe)
    await AsyncStorage.setItem('equipes', JSON.stringify(novaListaEquipes))
    setEquipes(novaListaEquipes)
    Toast.show({
      type: 'success',
      text1: 'equipe excluida com sucesso!'
    })
  }

  function handleExluirEquipe() {
    excluirEquipe(equipeASerExcluida)
    setEquipeASerExcluida(null)
    hideModal()
  }

  return (
    <View style={styles.container}>

      <Text variant='titleLarge' style={styles.title} >Lista de equipes</Text>

      <FlatList
        style={styles.list}
        data={equipes}
        renderItem={({ item }) => (
          <Card
            mode='outlined'
            style={styles.card}
          >
            <Card.Content
              style={styles.cardContent}
            >
              <View style={{ flex: 1 }}>
                <Text variant='titleMedium'>{item?.nome}</Text>
                <Text variant='bodyLarge'>Idade: {item?.idade}</Text>
                <Text variant='bodyLarge'>Altura: {item?.altura} cm</Text>
                <Text variant='bodyLarge'>Peso: {item.peso} kg</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text variant='titleMedium'>IMC</Text>
                <Text variant='bodyLarge'>{getImc(item)}</Text>
              </View>


            </Card.Content>
            <Card.Actions>
              <Button onPress={() => navigation.push('FormEquipes', { acao: editarEquipe, equipe: item })}>
                Editar
              </Button>
              <Button onPress={() => {
                setEquipeASerExcluida(item)
                showModal()
              }}>
                Excluir
              </Button>
            </Card.Actions>
          </Card>
        )}
      />

      {/* Botão Flutuante */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.push('FormEquipes', { acao: adicionarEquipe })}
      />


      {/* Modal Excluir Usuário */}
      <Portal>
        <Dialog visible={showModalExcluirUsuario} onDismiss={hideModal}>
          <Dialog.Title>Atenção!</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">Tem certeza que deseja excluir este usuário?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideModal}>Voltar</Button>
            <Button onPress={handleExluirEquipe}>Tenho Certeza</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  list: {
    width: '90%',
  },
  card: {
    marginTop: 15
  },
  cardContent: {
    flexDirection: 'row',
    backgroundColor: MD3Colors.primary80,
    borderWidth: 2,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingBottom: 15
  }
})