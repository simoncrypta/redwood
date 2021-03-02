export interface FlashMessage {
  id: number
  text: string
  style?: React.HTMLAttributes<HTMLDivElement>['style']
  classes?: string
  persist?: boolean
  viewed?: boolean
}

type FlashAction =
  | {
      type: 'ADD_MESSAGE'
      message: Omit<FlashMessage, 'id'>
    }
  | {
      type: 'DISMISS_MESSAGE'
      messageId: number
    }
  | {
      type: 'CYCLE_MESSAGE'
      messageId: number
    }

export default (messages: FlashMessage[] = [], action: FlashAction) => {
  switch (action.type) {
    case 'ADD_MESSAGE': {
      const newMessage = {
        ...action.message,
        id: messages.length,
      }

      return [...messages, newMessage]
    }
    case 'DISMISS_MESSAGE': {
      return messages.filter((msg) => msg.id !== action.messageId)
    }
    case 'CYCLE_MESSAGE': {
      // find the message
      // if viewed and not persist, remove it
      // else mark as viewed
      return messages.reduce<FlashMessage[]>((acc, msg) => {
        if (msg.id !== action.messageId) {
          return [...acc, msg]
        }

        if (msg.viewed && !msg.persist) {
          return acc
        }

        return [...acc, { ...msg, viewed: true }]
      }, [])
    }
  }
}
