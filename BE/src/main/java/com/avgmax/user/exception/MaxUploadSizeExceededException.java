package com.avgmax.user.exception;

public class MaxUploadSizeExceededException extends RuntimeException  {
    public MaxUploadSizeExceededException (String message){
        super(message);
    }
}
