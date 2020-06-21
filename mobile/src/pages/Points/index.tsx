import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Feather as Icon } from '@expo/vector-icons'
import { useNavigation, useRoute } from '@react-navigation/native'
//uso de mapas: expo install react-native-maps
//uso de constants: expo install expo-constants
import Constants from 'expo-constants';
import MapView, { Marker } from 'react-native-maps';
//utilizacao de elementos svg: expo install react-native-svg
import { SvgUri } from 'react-native-svg';
import api from '../../services/api';
//expo install expo-location
import * as Location from 'expo-location';

interface Item {
  id: number;
  title: string;
  image_url: string;
}

interface Ponto {
  id: number;
  name: string;
  image: string;
  image_url: string;
  latitude: number;
  longitude: number;
}

interface sentParams {
  uf: string;
  city: string;
} 

const Points = () => {

  const [items, setItems] = useState<Item[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [initialPosition, setInitialPosition] = useState<[number, number]>([0, 0]);
  const [pontos, setPontos] = useState<Ponto[]>([]);
  const navigation = useNavigation();
  const route = useRoute();

  const routeParams =  route.params as sentParams;

  useEffect(() => {
    async function loadPosition() {
      const { status } = await Location.requestPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Ooops!', 'Precisamos da sua permissão para obter a localização.');
        return;
      }

      const location = await Location.getCurrentPositionAsync();
      const { latitude, longitude } = location.coords;

      setInitialPosition([
        latitude,
        longitude
      ])
    }

    loadPosition();

  }, []);


  useEffect(() => {
    api.get('items').then(response => {
      setItems(response.data);
    });
  }, []);


  useEffect(() => {
    api.get('pontos', {
      params: {
        city: routeParams.city,
        uf: routeParams.uf,
        items: selectedItems
      }
    }).then(response => {
      console.log(selectedItems)
      setPontos(response.data);
    })
  }, [selectedItems]);

  function HandleNavigateBack() {
    navigation.goBack();
  }

  function HandleNavigateToDetail(id: number) {
    navigation.navigate('Detail', { ponto_id: id });
  }

  function HandleSelectItem(id: number) {
    const alreadySelected = selectedItems.findIndex(item => item === id);

    if (alreadySelected >= 0) {
      const filterItems = selectedItems.filter(item => item !== id);
      setSelectedItems(filterItems);
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  }


  return (
    //fragment <> funciona como uma view, mas sem resultado visual
    <>
      <View style={styles.container}>
        <TouchableOpacity onPress={HandleNavigateBack}>
          <Icon name='arrow-left' size={20} color='#34cb79' />
        </TouchableOpacity>

        <Text style={styles.title}>
          Bem vindo.
        </Text>

        <Text style={styles.description}>
          Encontre no mapa um ponto de coleta.
        </Text>

        <View style={styles.mapContainer}>
          {/* IF initialPosition[0] (latitude) for diferente de 0, ou seja, se ela já tiver
          sido buscada pelo getCurrentPosition, exibir o mapa. Não há senão. */}
          {initialPosition[0] !== 0 && (<MapView
            style={styles.map}
            initialRegion={{
              latitude: initialPosition[0],
              longitude: initialPosition[1],
              latitudeDelta: 0.025,
              longitudeDelta: 0.025,
            }} >

            {pontos.map(ponto => (
              <Marker
                key={String(ponto.id)}
                onPress={() => HandleNavigateToDetail(ponto.id)}
                style={styles.mapMarker}
                coordinate={{
                  'latitude': ponto.latitude,
                  'longitude': ponto.longitude,
                }} >

                <View style={styles.mapMarkerContainer}>
                  <Image
                    style={styles.mapMarkerImage}
                    source={
                      { uri: ponto.image_url }} />
                  <Text style={styles.mapMarkerTitle}>{ponto.name}</Text>
                </View>
              </Marker>
            ))}

          </MapView>)}
        </View>
      </View>

      <View style={styles.itemsContainer}>

        <ScrollView horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        >

          {items.map(item => (
            <TouchableOpacity
              key={String(item.id)}
              style={[
                styles.item,
                selectedItems.includes(item.id) ? styles.selectedItem : {}
              ]}
              onPress={() => HandleSelectItem(item.id)} >
              <SvgUri width={42} height={42} uri={item.image_url} />
              <Text style={styles.itemTitle}>{item.title}</Text>
            </TouchableOpacity>
          ))}

        </ScrollView>
      </View>

    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 20 + Constants.statusBarHeight,
  },

  title: {
    fontSize: 20,
    fontFamily: 'Ubuntu_700Bold',
    marginTop: 24,
  },

  description: {
    color: '#6C6C80',
    fontSize: 16,
    marginTop: 4,
    fontFamily: 'Roboto_400Regular',
  },

  mapContainer: {
    flex: 1,
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 16,
  },

  map: {
    width: '100%',
    height: '100%',
  },

  mapMarker: {
    width: 90,
    height: 80,
  },

  mapMarkerContainer: {
    width: 90,
    height: 70,
    backgroundColor: '#34CB79',
    flexDirection: 'column',
    borderRadius: 8,
    overflow: 'hidden',
    alignItems: 'center'
  },

  mapMarkerImage: {
    width: 90,
    height: 45,
    resizeMode: 'cover',
  },

  mapMarkerTitle: {
    flex: 1,
    fontFamily: 'Roboto_400Regular',
    color: '#FFF',
    fontSize: 10,
    lineHeight: 23,
  },

  itemsContainer: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 32,
  },

  item: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#eee',
    height: 120,
    width: 120,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'space-between',

    textAlign: 'center',
  },

  selectedItem: {
    borderColor: '#34CB79',
    borderWidth: 2,
  },

  itemTitle: {
    fontFamily: 'Roboto_400Regular',
    textAlign: 'center',
    fontSize: 13,
  },
});


export default Points;