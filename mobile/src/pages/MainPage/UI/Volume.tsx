import React, { useEffect, useState } from 'react';
import { View, StyleSheet, DimensionValue, Text } from 'react-native';
import GetVolume from "../API/GetVolume";


const VolumeLine = () => {
  const [usedVolume, setUsedVolume] = useState<number>(0);
  const [freeVolume, setFreeVolume] = useState<number>(0);
  const [usedWidth, setUsedWidth] = useState<DimensionValue>(0);

  useEffect(() => {
    const set = async () => {
      const response = await GetVolume();
      setFreeVolume(response.free / 10 ** 9);
      setUsedVolume(response.used / 10 ** 9);
      if (usedVolume != null && freeVolume != null) {
        const sum = usedVolume + freeVolume;
        const totalWidth = 100;
        const usedWidth = ((usedVolume / sum) * totalWidth);
        const used: DimensionValue = `${usedWidth}%`

        setUsedWidth(used);
      }
    }
    set();
  }, []);

  return (
      <View>
        <Text style={[styles.text, {
          fontSize: 20,
          fontWeight: 500,
          marginBottom: 4
        }]}>Доступно: {freeVolume.toFixed(2)} ГБ</Text>
        <View style={styles.line}>
          <View style={[styles.progressBar, {width: usedWidth, backgroundColor: 'rgba(243, 61, 130, 0.5)'}]}/>
        </View>
        <Text style={[styles.text, {marginBottom: 40}]}>Использованно: {usedVolume.toFixed(2)}ГБ/{(usedVolume + freeVolume).toFixed(2)}ГБ</Text>
      </View>
  );
}

const styles = StyleSheet.create({
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 20,
    width: '95%',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor:'#fbf8fa',
    backgroundColor: 'rgba(200, 198, 198, 0.61)',
  },
  progressBar: {
    height: '100%',
  },
  text: {
    marginLeft: 8,
  },
});

export default VolumeLine;
