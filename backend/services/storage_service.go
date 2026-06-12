package services

import (
	"bytes"
	"context"
	"fmt"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/google/uuid"
)

type StorageService struct {
	client    *s3.Client
	bucket    string
	publicURL string
}

func NewStorageService(endpoint, bucket, publicURL, keyID, secret string) (*StorageService, error) {
	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithRegion("auto"),
		config.WithCredentialsProvider(
			credentials.NewStaticCredentialsProvider(keyID, secret, ""),
		),
	)

	if err != nil {
		return nil, err
	}

	client := s3.NewFromConfig(cfg, func(o *s3.Options) {
		o.BaseEndpoint = aws.String(endpoint)
		o.UsePathStyle = true
	})

	return &StorageService{client: client, bucket: bucket, publicURL: publicURL}, nil
}

func (s *StorageService) UploadImage(ctx context.Context, imageBytes []byte, contentType string) (publicURL string, err error) {
	filename := uuid.New().String() + ".jpg"

	_, err = s.client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(s.bucket),
		Key:         aws.String(filename),
		Body:        bytes.NewReader(imageBytes),
		ContentType: aws.String(contentType),
	})

	return fmt.Sprintf("%s/%s", s.publicURL, filename), err
}
