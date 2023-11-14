import React, { useState } from 'react';
import { View, Image, StyleSheet, ScrollView, Modal, TouchableOpacity } from 'react-native';
import { Title, Text, Button } from 'react-native-paper';

export default function Inicio() {
  const [modalVisible, setModalVisible] = useState(false);

  const openModal = () => {
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <View>
        <Image
          source={require('../img/Logo.jpg')}
          style={styles.image}
        />
      </View>
      <ScrollView style={styles.scrollView}>
        <Title style={styles.centeredText}>Bem-vindo ao app da Libertadores</Title>
        <Title style={[styles.centeredText, styles.largerText]}>
          Aqui o cadastro do seu time é rápido, confira já!
        </Title>
        <Button
          onPress={openModal}
          icon="plus"
          mode="contained"
        >
          <Text style={{color: 'white'}}>Clique aqui para saber mais</Text>
        </Button>
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalText}>
              Nós estamos entusiasmados por você estar aqui, pronto para se juntar à competição de futebol mais prestigiada do continente europeu. A Champions League é conhecida por reunir os melhores clubes do mundo em uma batalha épica pelo título mais cobiçado do futebol de clubes.
              {"\n\n"}
              Nesta página de cadastro, você terá a oportunidade de fazer parte dessa grandeza. É aqui que você poderá registrar seu time e participar de uma jornada emocionante, repleta de partidas eletrizantes, rivalidades intensas e momentos inesquecíveis.
              {"\n\n"}
              Ao se cadastrar, você estará abrindo as portas para enfrentar os gigantes do futebol, competindo em estádios icônicos e testando suas habilidades contra os melhores jogadores do mundo. A Champions League é o palco onde os sonhos se realizam e onde a história é escrita a cada partida.
              {"\n\n"}
              Este é o lugar onde o futebol se transforma em magia, onde a paixão e a emoção tomam conta dos corações dos torcedores ao redor do globo. A cada edição, a competição nos presenteia com jogos épicos, lances geniais e momentos de pura adrenalina que ficarão gravados na memória de todos os amantes do esporte.
              {"\n\n"}
              Então, não perca tempo! Seja parte dessa jornada emocionante, inscreva seu time na Champions League e prepare-se para vivenciar a grandiosidade do futebol europeu. Estamos ansiosos para ver você em campo, lutando pelo título e deixando sua marca na história desta competição lendária.
              {"\n\n"}
              Abrace o desafio, supere os obstáculos e faça parte da elite do futebol mundial. Junte-se a nós nesta página de cadastro e entre para a história da Champions League. Que comece a sua jornada rumo à glória!
            </Text>
            <TouchableOpacity onPress={closeModal}>
              <Text style={styles.modalButton}>Fechar</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  image: {
    width: 400,
    height: 450,
  },
  scrollView: {
    flex: 1,
    width: '80%', 
  },
  centeredText: {
    textAlign: 'center',
    marginVertical: 10,
    color: 'black',
    fontWeight: 'bold',
    marginTop: 20
  },
  largerText: {
    fontSize: 20, 
  },
  text: {
    color: 'black',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  modalText: {
    marginBottom: 10,
    fontSize: 16,
  },
});
