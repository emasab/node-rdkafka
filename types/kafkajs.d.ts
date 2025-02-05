import * as tls from 'tls'

export type BrokersFunction = () => string[] | Promise<string[]>

export type Mechanism = {
  mechanism: string
}

type SASLMechanismOptionsMap = {
  plain: { username: string; password: string }
  'scram-sha-256': { username: string; password: string }
  'scram-sha-512': { username: string; password: string }
}

export type SASLMechanism = keyof SASLMechanismOptionsMap
type SASLMechanismOptions<T> = T extends SASLMechanism
  ? { mechanism: T } & SASLMechanismOptionsMap[T]
  : never
export type SASLOptions = SASLMechanismOptions<SASLMechanism>

export interface KafkaConfig {
  brokers: string[] | BrokersFunction
  ssl?: boolean
  sasl?: SASLOptions | Mechanism
  clientId?: string
  connectionTimeout?: number
  authenticationTimeout?: number
  reauthenticationThreshold?: number
  requestTimeout?: number
  enforceRequestTimeout?: boolean
}

export interface ProducerConfig {
  metadataMaxAge?: number
  allowAutoTopicCreation?: boolean
  idempotent?: boolean
  transactionalId?: string
  transactionTimeout?: number
  maxInFlightRequests?: number
}

export interface IHeaders {
  [key: string]: Buffer | string | (Buffer | string)[] | undefined
}

export interface Message {
  key?: Buffer | string | null
  value: Buffer | string | null
  partition?: number
  headers?: IHeaders
  timestamp?: string
}

export enum CompressionTypes {
  None = 0,
  GZIP = 1,
  Snappy = 2,
  LZ4 = 3,
  ZSTD = 4,
}

export var CompressionCodecs: {
  [CompressionTypes.GZIP]: () => any
  [CompressionTypes.Snappy]: () => any
  [CompressionTypes.LZ4]: () => any
  [CompressionTypes.ZSTD]: () => any
}

export interface ProducerRecord {
  topic: string
  messages: Message[]
  acks?: number
  timeout?: number
  compression?: CompressionTypes
}

export type RecordMetadata = {
  topicName: string
  partition: number
  errorCode: number
  offset?: string
  timestamp?: string
  baseOffset?: string
  logAppendTime?: string
  logStartOffset?: string
}

export class Kafka {
  constructor(config: KafkaConfig)
  producer(config?: ProducerConfig): Producer
  consumer(config: ConsumerConfig): Consumer
}

type Sender = {
  send(record: ProducerRecord): Promise<RecordMetadata[]>
}

export type Producer = Sender & {
  connect(): Promise<void>
  disconnect(): Promise<void>
}

export interface RetryOptions {
  maxRetryTime?: number
  initialRetryTime?: number
  factor?: number
  multiplier?: number
  retries?: number
  restartOnFailure?: (e: Error) => Promise<boolean>
}

export interface ConsumerConfig {
  groupId: string
  metadataMaxAge?: number
  sessionTimeout?: number
  rebalanceTimeout?: number
  heartbeatInterval?: number
  maxBytesPerPartition?: number
  minBytes?: number
  maxBytes?: number
  maxWaitTimeInMs?: number
  retry?: RetryOptions & { restartOnFailure?: (err: Error) => Promise<boolean> }
  allowAutoTopicCreation?: boolean
  maxInFlightRequests?: number
  readUncommitted?: boolean
  rackId?: string
}

export type ConsumerEvents = {
  HEARTBEAT: 'consumer.heartbeat'
  COMMIT_OFFSETS: 'consumer.commit_offsets'
  GROUP_JOIN: 'consumer.group_join'
  FETCH_START: 'consumer.fetch_start'
  FETCH: 'consumer.fetch'
  START_BATCH_PROCESS: 'consumer.start_batch_process'
  END_BATCH_PROCESS: 'consumer.end_batch_process'
  CONNECT: 'consumer.connect'
  DISCONNECT: 'consumer.disconnect'
  STOP: 'consumer.stop'
  CRASH: 'consumer.crash'
  REBALANCING: 'consumer.rebalancing'
  RECEIVED_UNSUBSCRIBED_TOPICS: 'consumer.received_unsubscribed_topics'
  REQUEST: 'consumer.network.request'
  REQUEST_TIMEOUT: 'consumer.network.request_timeout'
  REQUEST_QUEUE_SIZE: 'consumer.network.request_queue_size'
}


export enum logLevel {
  NOTHING = 0,
  ERROR = 1,
  WARN = 2,
  INFO = 4,
  DEBUG = 5,
}

export type Logger = {
  info: (message: string, extra?: object) => void
  error: (message: string, extra?: object) => void
  warn: (message: string, extra?: object) => void
  debug: (message: string, extra?: object) => void

  namespace: (namespace: string, logLevel?: logLevel) => Logger
  setLogLevel: (logLevel: logLevel) => void
}

type ValueOf<T> = T[keyof T]

export interface InstrumentationEvent<T> {
  id: string
  type: string
  timestamp: number
  payload: T
}

export type RemoveInstrumentationEventListener<T> = () => void

export type ConsumerFetchStartEvent = InstrumentationEvent<{ nodeId: number }>
export type ConsumerFetchEvent = InstrumentationEvent<{
  numberOfBatches: number
  duration: number
  nodeId: number
}>

export type ConsumerHeartbeatEvent = InstrumentationEvent<{
  groupId: string
  memberId: string
  groupGenerationId: number
}>

export type ConsumerCommitOffsetsEvent = InstrumentationEvent<{
  groupId: string
  memberId: string
  groupGenerationId: number
  topics: TopicOffsets[]
}>

export interface IMemberAssignment {
  [key: string]: number[]
}

export type ConsumerGroupJoinEvent = InstrumentationEvent<{
  duration: number
  groupId: string
  isLeader: boolean
  leaderId: string
  groupProtocol: string
  memberId: string
  memberAssignment: IMemberAssignment
}>

interface IBatchProcessEvent {
  topic: string
  partition: number
  highWatermark: string
  offsetLag: string
  offsetLagLow: string
  batchSize: number
  firstOffset: string
  lastOffset: string
}

export type ConsumerStartBatchProcessEvent = InstrumentationEvent<IBatchProcessEvent>

export type ConsumerEndBatchProcessEvent = InstrumentationEvent<
  IBatchProcessEvent & { duration: number }
>

export type ConnectEvent = InstrumentationEvent<null>

export type DisconnectEvent = InstrumentationEvent<null>

export type ConsumerCrashEvent = InstrumentationEvent<{
  error: Error
  groupId: string
  restart: boolean
}>

export type ConsumerRebalancingEvent = InstrumentationEvent<{
  groupId: string
  memberId: string
}>

export type ConsumerReceivedUnsubcribedTopicsEvent = InstrumentationEvent<{
  groupId: string
  generationId: number
  memberId: string
  assignedTopics: string[]
  topicsSubscribed: string[]
  topicsNotSubscribed: string[]
}>

export type RequestEvent = InstrumentationEvent<{
  apiKey: number
  apiName: string
  apiVersion: number
  broker: string
  clientId: string
  correlationId: number
  createdAt: number
  duration: number
  pendingDuration: number
  sentAt: number
  size: number
}>

export type RequestTimeoutEvent = InstrumentationEvent<{
  apiKey: number
  apiName: string
  apiVersion: number
  broker: string
  clientId: string
  correlationId: number
  createdAt: number
  pendingDuration: number
  sentAt: number
}>

export type RequestQueueSizeEvent = InstrumentationEvent<{
  broker: string
  clientId: string
  queueSize: number
}>

interface MessageSetEntry {
  key: Buffer | null
  value: Buffer | null
  timestamp: string
  attributes: number
  offset: string
  size: number
  headers?: never
}

interface RecordBatchEntry {
  key: Buffer | null
  value: Buffer | null
  timestamp: string
  attributes: number
  offset: string
  headers: IHeaders
  size?: never
}

export type Batch = {
  topic: string
  partition: number
  highWatermark: string
  messages: KafkaMessage[]
  isEmpty(): boolean
  firstOffset(): string | null
  lastOffset(): string
  offsetLag(): string
  offsetLagLow(): string
}

export type KafkaMessage = MessageSetEntry | RecordBatchEntry

export interface EachMessagePayload {
  topic: string
  partition: number
  message: KafkaMessage
  heartbeat(): Promise<void>
  pause(): () => void
}

export interface EachBatchPayload {
  batch: Batch
  resolveOffset(offset: string): void
  heartbeat(): Promise<void>
  pause(): () => void
  commitOffsetsIfNecessary(offsets?: Offsets): Promise<void>
  uncommittedOffsets(): OffsetsByTopicPartition
  isRunning(): boolean
  isStale(): boolean
}

export type EachBatchHandler = (payload: EachBatchPayload) => Promise<void>

export type EachMessageHandler = (payload: EachMessagePayload) => Promise<void>

export type ConsumerSubscribeTopics = { topics: (string | RegExp)[]; fromBeginning?: boolean }

export type ConsumerRunConfig = {
  autoCommit?: boolean
  autoCommitInterval?: number | null
  autoCommitThreshold?: number | null
  partitionsConsumedConcurrently?: number
  eachMessage?: EachMessageHandler
}

export interface Offsets {
  topics: TopicOffsets[]
}

export interface TopicOffsets {
  topic: string
  partitions: PartitionOffset[]
}


export interface PartitionOffset {
  partition: number
  offset: string
}

export type TopicPartitions = { topic: string; partitions: number[] }

export type TopicPartition = {
  topic: string
  partition: number
}
export type TopicPartitionOffset = TopicPartition & {
  offset: string
}

export type TopicPartitionOffsetAndMetadata = TopicPartitionOffset & {
  metadata?: string | null
}

export interface OffsetsByTopicPartition {
  topics: TopicOffsets[]
}

export type MemberDescription = {
  clientHost: string
  clientId: string
  memberId: string
  memberAssignment: Buffer
  memberMetadata: Buffer
}

export type ConsumerGroupState =
  | 'Unknown'
  | 'PreparingRebalance'
  | 'CompletingRebalance'
  | 'Stable'
  | 'Dead'
  | 'Empty'

export type GroupDescription = {
  groupId: string
  members: MemberDescription[]
  protocol: string
  protocolType: string
  state: ConsumerGroupState
}

export type Consumer = {
  connect(): Promise<void>
  disconnect(): Promise<void>
  subscribe(subscription: ConsumerSubscribeTopics ): Promise<void>
  stop(): Promise<void>
  run(config?: ConsumerRunConfig): Promise<void>
  commitOffsets(topicPartitions: Array<TopicPartitionOffsetAndMetadata>): Promise<void>
  seek(topicPartitionOffset: TopicPartitionOffset): Promise<void>
  describeGroup(): Promise<GroupDescription>
  pause(topics: Array<{ topic: string; partitions?: number[] }>): void
  paused(): TopicPartitions[]
  assignment(): TopicPartitions[]
  resume(topics: Array<{ topic: string; partitions?: number[] }>): void
  on(
    eventName: ConsumerEvents['HEARTBEAT'],
    listener: (event: ConsumerHeartbeatEvent) => void
  ): RemoveInstrumentationEventListener<typeof eventName>
  on(
    eventName: ConsumerEvents['COMMIT_OFFSETS'],
    listener: (event: ConsumerCommitOffsetsEvent) => void
  ): RemoveInstrumentationEventListener<typeof eventName>
  on(
    eventName: ConsumerEvents['GROUP_JOIN'],
    listener: (event: ConsumerGroupJoinEvent) => void
  ): RemoveInstrumentationEventListener<typeof eventName>
  on(
    eventName: ConsumerEvents['FETCH_START'],
    listener: (event: ConsumerFetchStartEvent) => void
  ): RemoveInstrumentationEventListener<typeof eventName>
  on(
    eventName: ConsumerEvents['FETCH'],
    listener: (event: ConsumerFetchEvent) => void
  ): RemoveInstrumentationEventListener<typeof eventName>
  on(
    eventName: ConsumerEvents['START_BATCH_PROCESS'],
    listener: (event: ConsumerStartBatchProcessEvent) => void
  ): RemoveInstrumentationEventListener<typeof eventName>
  on(
    eventName: ConsumerEvents['END_BATCH_PROCESS'],
    listener: (event: ConsumerEndBatchProcessEvent) => void
  ): RemoveInstrumentationEventListener<typeof eventName>
  on(
    eventName: ConsumerEvents['CONNECT'],
    listener: (event: ConnectEvent) => void
  ): RemoveInstrumentationEventListener<typeof eventName>
  on(
    eventName: ConsumerEvents['DISCONNECT'],
    listener: (event: DisconnectEvent) => void
  ): RemoveInstrumentationEventListener<typeof eventName>
  on(
    eventName: ConsumerEvents['STOP'],
    listener: (event: InstrumentationEvent<null>) => void
  ): RemoveInstrumentationEventListener<typeof eventName>
  on(
    eventName: ConsumerEvents['CRASH'],
    listener: (event: ConsumerCrashEvent) => void
  ): RemoveInstrumentationEventListener<typeof eventName>
  on(
    eventName: ConsumerEvents['REBALANCING'],
    listener: (event: ConsumerRebalancingEvent) => void
  ): RemoveInstrumentationEventListener<typeof eventName>
  on(
    eventName: ConsumerEvents['RECEIVED_UNSUBSCRIBED_TOPICS'],
    listener: (event: ConsumerReceivedUnsubcribedTopicsEvent) => void
  ): RemoveInstrumentationEventListener<typeof eventName>
  on(
    eventName: ConsumerEvents['REQUEST'],
    listener: (event: RequestEvent) => void
  ): RemoveInstrumentationEventListener<typeof eventName>
  on(
    eventName: ConsumerEvents['REQUEST_TIMEOUT'],
    listener: (event: RequestTimeoutEvent) => void
  ): RemoveInstrumentationEventListener<typeof eventName>
  on(
    eventName: ConsumerEvents['REQUEST_QUEUE_SIZE'],
    listener: (event: RequestQueueSizeEvent) => void
  ): RemoveInstrumentationEventListener<typeof eventName>
  on(
    eventName: ValueOf<ConsumerEvents>,
    listener: (event: InstrumentationEvent<any>) => void
  ): RemoveInstrumentationEventListener<typeof eventName>
  logger(): Logger
  readonly events: ConsumerEvents
}

