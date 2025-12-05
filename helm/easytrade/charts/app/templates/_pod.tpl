{{- define "app.podTemplate" -}}
metadata:
  {{- with .Values.podAnnotations }}
  annotations:
    {{- toYaml . | nindent 4 }}
  {{- end }}
  labels:
    {{- include "app.labels" . | nindent 4 }}
    {{- with .Values.podLabels }}
    {{- toYaml . | nindent 4 }}
    {{- end }}
spec:
  {{- with .Values.imagePullSecrets }}
  imagePullSecrets:
    {{- toYaml . | nindent 4 }}
  {{- end }}
  serviceAccountName: {{ include "app.serviceAccountName" . }}
  {{- with .Values.podSecurityContext }}
  securityContext:
    {{- toYaml . | nindent 4 }}
  {{- end }}
  containers:
    - name: {{ .Chart.Name }}
      {{- with .Values.securityContext }}
      securityContext:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      image: "{{ .Values.image.repository }}:{{ .Values.image.tag | default .Values.global.image.tag }}"
      imagePullPolicy: {{ .Values.image.pullPolicy }}
      env:
      {{- with .Values.envFromSecret }}
        {{- range $key, $secretKeyRef := . }}
        - name: {{ $key }}
          valueFrom:
            secretKeyRef:
              name: {{ tpl ($secretKeyRef.name | toString) $ }}
              key: {{ $secretKeyRef.key }}
        {{- end }}
      {{- end }}
      {{- with .Values.env }}
        {{- range $key, $value := . }}
        - name: {{ $key }}
          value: {{ tpl ($value | toString) $ | quote }}
        {{- end }}
      {{- end }}
      ports:
      {{- if .Values.service.ports }}
        {{- range .Values.service.ports }}
        - name: {{ .name }}
          containerPort: {{ .containerPort | default .targetPort }}
          protocol: {{ .protocol | default "TCP" }}
        {{- end }}
      {{- else }}
        - name: http
          containerPort: {{ .Values.service.port }}
          protocol: TCP
      {{- end }}
      {{- with .Values.livenessProbe }}
      livenessProbe:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      {{- with .Values.readinessProbe }}
      readinessProbe:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      {{- with .Values.resources }}
      resources:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      volumeMounts:
      {{- if and .Values.persistence.enabled .Values.persistence.mountPath }}
        - name: data
          mountPath: {{ .Values.persistence.mountPath }}
      {{- end }}
      {{- with .Values.volumeMounts }}
        {{- toYaml . | nindent 8 }}
      {{- end }}
  {{- with .Values.volumes }}
  volumes:
    {{- toYaml . | nindent 4 }}
  {{- end }}
  {{- with .Values.nodeSelector }}
  nodeSelector:
    {{- toYaml . | nindent 4 }}
  {{- end }}
  {{- with .Values.affinity }}
  affinity:
    {{- toYaml . | nindent 4 }}
  {{- end }}
  {{- with .Values.tolerations }}
  tolerations:
    {{- toYaml . | nindent 4 }}
  {{- end }}
{{- end -}}
