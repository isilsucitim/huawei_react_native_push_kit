import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  View,
  NativeModules,
  Linking,
  NativeEventEmitter,
} from 'react-native';
import {RNRemoteMessage, RNErrorEnum} from '@hmscore/react-native-hwpush';

import * as R from 'ramda';

export class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      displayText: 'Waiting for Token...',
    };
  }

  componentDidMount() {
    const eventTokenEmitter = new NativeEventEmitter(
      NativeModules.ToastExample,
    );
    this.listenerToken = eventTokenEmitter.addListener(
      'PushTokenMsgReceiverEvent',
      (event) => {
        console.log('log received token:' + event.token + '\n');
        this.setState({
          displayText: event.token,
        });
      },
    );
    this.getToken();
    this.initPushMessageListener();
    this.onMessage();
  }
  getToken() {
    NativeModules.RNHmsInstanceId.getToken((result, token) => {
      const displayText =
        result === '0' ? token : 'Token registration failed, please restart.';
      console.log(JSON.stringify(token));
      this.setState({
        displayText,
      });
    });
  }
  initPushMessageListener() {
    const eventEmitter = new NativeEventEmitter(NativeModules.ToastExample);
    this.listenerPushMsg = eventEmitter.addListener(
      'PushMsgReceiverEvent',
      (event) => {
        const message = new RNRemoteMessage(event.msg);
        this.handleData(JSON.parse(message.getData()));
      },
    );
  }
  onMessage = () => {
    let emitter = new NativeEventEmitter();
    listener = emitter.addListener('PushMsgReceiverEvent', (event) => {
      console.log(JSON.stringify(event));
    });
  };
  Subscribe = () => {
    NativeModules.RNHmsMessaging.subscribe('myTopic', (result, errinfo) => {
      if (result == RNErrorEnum.SUCCESS) {
        console.log('Subscribed!');
      } else {
        console.log('Failed to subscribe : ' + errinfo);
      }
    });
  };
  unSuscribe = () => {
    NativeModules.RNHmsMessaging.unsubscribe('myTopic', (result, errinfo) => {
      if (result == RNErrorEnum.SUCCESS) {
        console.log('Unsubscribed!');
      } else {
        console.log('Failed to unsubscribe : ' + errinfo);
      }
    });
  };
  onMessageReceived(message) {
    this.setState({
      displayText: message,
    });
  }

  handleData(data) {
    const message = R.propOr(false, 'message', data);

    if (message) this.onMessageReceived(message);
  }
  render() {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'aqua',
        }}>
        <Text>{this.state.displayText}</Text>
      </View>
    );
  }
}

export default App;

const styles = StyleSheet.create({});
